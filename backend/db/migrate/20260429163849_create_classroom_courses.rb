class CreateClassroomCourses < ActiveRecord::Migration[8.1]
  def change
    create_table :classroom_courses do |t|
      t.string :sf_course_id
      t.string :title, null: false
      t.text :description
      t.string :thumbnail_url
      t.string :deep_link_url
      t.string :category
      t.integer :duration_minutes

      t.timestamps
    end
    add_index :classroom_courses, :sf_course_id, unique: true
    add_index :classroom_courses, :category
  end
end
