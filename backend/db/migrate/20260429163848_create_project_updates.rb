class CreateProjectUpdates < ActiveRecord::Migration[8.1]
  def change
    create_table :project_updates do |t|
      t.references :incubator_project, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :body
      t.string :milestone_tag

      t.timestamps
    end
  end
end
