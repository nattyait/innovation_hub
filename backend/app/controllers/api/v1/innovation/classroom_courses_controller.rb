module Api
  module V1
    module Innovation
      class ClassroomCoursesController < BaseController
        def index
          courses = SuccessFactors::CourseService.courses(category: params[:category])
          render json: courses.map { |c| serialize_course(c) }
        end

        def show
          course = ClassroomCourse.find(params[:id])
          render json: serialize_course(course)
        end

        private

        def serialize_course(c)
          { id: c.id, title: c.title, description: c.description,
            thumbnail_url: c.thumbnail_url, deep_link_url: c.deep_link_url,
            category: c.category, duration_minutes: c.duration_minutes }
        end
      end
    end
  end
end
