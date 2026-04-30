class CreateProjectMembers < ActiveRecord::Migration[8.1]
  def change
    create_table :project_members do |t|
      t.references :incubator_project, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.string :role

      t.timestamps
    end
  end
end
