Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      namespace :innovation do
        post "sessions",         to: "sessions#create"
        post "sessions/persona", to: "sessions#persona"

        get "summary",                to: "summary#index"
        get "summary/trending_ideas", to: "summary#trending_ideas"
        get "summary/leaderboard",    to: "summary#top_leaderboard"

        resources :ideas, only: [:index, :show, :create, :update, :destroy] do
          collection { get :pending_approvals }
          member do
            patch :submit
            patch :retract
            patch :approve
            patch :decline
            patch :return_idea, path: :return
          end
          resources :hearts,       only: [:create]
          resources :comments,     only: [:index, :create]
          resources :applications, only: [:index, :create], controller: :idea_applications
        end

        delete "hearts/:id",          to: "hearts#destroy",            as: :heart
        delete "comments/:id",        to: "comments#destroy",          as: :comment
        post   "comments/:id/upvote", to: "comments#upvote",           as: :comment_upvote
        delete "comments/:id/upvote", to: "comments#remove_upvote"

        resources :idea_applications, only: [] do
          resource :impact, only: [:create, :update], controller: :idea_impacts
        end

        resources :communities, only: [:index] do
          member { get :ideas }
        end

        get  "leaderboard", to: "leaderboard#index"

        # Innovation Projects
        get  "sponsor/dashboard", to: "innovation_projects#sponsor_dashboard"
        resources :innovation_projects, only: [:index, :show, :create, :update] do
          member do
            post :add_member
            delete "members/:user_id", to: "innovation_projects#remove_member", as: :remove_member
          end
          resources :topics, only: [:index, :show, :create],
                             controller: :project_topics do
            resources :comments, only: [:create],
                                 controller: :project_topic_comments
          end
          resources :deployments, only: [:index, :create],
                                  controller: :project_deployments
        end
        patch "project_deployments/:id", to: "project_deployments#update"
        resources :project_deployments, only: [] do
          resource :impact, only: [:create, :update],
                            controller: :project_deployment_impacts
        end

        resources :notifications, only: [:index] do
          collection { patch :mark_read }
        end

        namespace :admin do
          resources :ideas, only: [:index, :update, :destroy]
          post  "heart_budgets/open_period", to: "heart_budgets#open_period"
          patch "heart_budgets/settings",    to: "heart_budgets#settings"
        end
      end
    end
  end
end
