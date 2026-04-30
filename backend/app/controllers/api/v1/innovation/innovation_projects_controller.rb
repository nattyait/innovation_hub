module Api
  module V1
    module Innovation
      class InnovationProjectsController < BaseController
        before_action :set_project, only: [:show, :update, :add_member, :remove_member]

        def index
          projects = InnovationProject.includes(:idea, :sponsor, :members)
                                      .order(created_at: :desc)
          render json: projects.map { |p| serialize_summary(p) }
        end

        def show
          render json: serialize_detail(@project)
        end

        # Sponsor converts an approved idea into an Innovation Project
        def create
          authorize_sponsor!
          idea = Idea.kept.find(params[:idea_id])
          return render json: { error: "ไอเดียต้องได้รับการอนุมัติก่อน" }, status: :unprocessable_entity unless idea.approved?

          project = InnovationProject.new(
            project_params.merge(idea: idea, sponsor: current_user, title: params[:title] || idea.title)
          )
          if project.save
            render json: serialize_detail(project), status: :created
          else
            render json: { errors: project.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def update
          authorize_project_editor!
          if @project.update(project_params)
            render json: serialize_detail(@project)
          else
            render json: { errors: @project.errors.full_messages }, status: :unprocessable_entity
          end
        end

        def add_member
          authorize_sponsor!
          user = User.find(params[:user_id])
          member = @project.innovation_project_members.find_or_create_by!(user: user) do |m|
            m.role = params[:role] || "member"
          end
          render json: serialize_member(member), status: :created
        end

        def remove_member
          authorize_sponsor!
          @project.innovation_project_members.find_by!(user_id: params[:user_id]).destroy
          head :no_content
        end

        # Sponsor dashboard — summary of all their projects + deployment statuses
        def sponsor_dashboard
          authorize_sponsor!
          projects = current_user.sponsored_projects
                                  .includes(:idea, innovation_project_members: :user,
                                            project_deployments: :project_deployment_impact)
                                  .order(created_at: :desc)
          render json: projects.map { |p| dashboard_serialize(p) }
        end

        private

        def set_project
          @project = InnovationProject.find(params[:id])
        end

        def project_params
          params.permit(:title, :department, :summary, :expectation, :pain_point,
                        :improved_process, :ai_usage, :quantitative_results,
                        :qualitative_results, :esg_impact, :status)
        end

        def authorize_sponsor!
          render json: { error: "Sponsor เท่านั้น" }, status: :forbidden unless current_user.sponsor? || current_user.admin?
        end

        def authorize_project_editor!
          is_member = @project.innovation_project_members.exists?(user_id: current_user.id)
          unless is_member || current_user.sponsor? || current_user.admin?
            render json: { error: "Forbidden" }, status: :forbidden
          end
        end

        def serialize_summary(p)
          {
            id: p.id, title: p.title, department: p.department,
            status: p.status, summary: p.summary,
            idea: { id: p.idea_id, title: p.idea.title },
            sponsor: { id: p.sponsor_id, name: p.sponsor.name },
            member_count: p.members.size,
            deployment_count: p.project_deployments.size,
            created_at: p.created_at
          }
        end

        def serialize_detail(p)
          {
            id: p.id, title: p.title, department: p.department, status: p.status,
            summary: p.summary, expectation: p.expectation, pain_point: p.pain_point,
            improved_process: p.improved_process, ai_usage: p.ai_usage,
            quantitative_results: p.quantitative_results,
            qualitative_results: p.qualitative_results, esg_impact: p.esg_impact,
            idea: { id: p.idea_id, title: p.idea.title },
            sponsor: { id: p.sponsor_id, name: p.sponsor.name, avatar_url: p.sponsor.avatar_url },
            members: p.innovation_project_members.includes(:user).map { |m| serialize_member(m) },
            created_at: p.created_at, updated_at: p.updated_at
          }
        end

        def serialize_member(m)
          { id: m.id, role: m.role,
            user: { id: m.user_id, name: m.user.name, avatar_url: m.user.avatar_url } }
        end

        def dashboard_serialize(p)
          deployments = p.project_deployments.map do |d|
            { id: d.id, department_name: d.department_name, status: d.status,
              start_date: d.start_date, end_date: d.end_date,
              overdue: d.end_date && d.end_date < Date.today && d.status == "not_started",
              has_impact: d.project_deployment_impact.present? }
          end
          { id: p.id, title: p.title, status: p.status,
            idea: { id: p.idea_id, title: p.idea.title },
            deployments: deployments }
        end
      end
    end
  end
end
