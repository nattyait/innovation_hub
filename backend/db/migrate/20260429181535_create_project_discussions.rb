class CreateProjectDiscussions < ActiveRecord::Migration[8.1]
  def change
    create_table :project_discussions do |t|
      t.references :incubator_project, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :body, null: false

      t.timestamps
    end
    add_index :project_discussions, [:incubator_project_id, :created_at]
  end
end
