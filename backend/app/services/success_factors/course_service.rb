# POC stub — returns seeded ClassroomCourse records.
# Production: replace with SAP SuccessFactors Learning API client.
module SuccessFactors
  class CourseService
    def self.sync
      # no-op in POC; courses are managed via seeds/admin
    end

    def self.courses(category: nil)
      scope = ClassroomCourse.ordered
      scope = scope.by_category(category) if category.present?
      scope
    end
  end
end
