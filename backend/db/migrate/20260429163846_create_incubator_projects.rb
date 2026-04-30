class CreateIncubatorProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :incubator_projects do |t|
      t.references :idea, null: false, foreign_key: true
      t.string :title
      t.text :summary
      t.string :status
      t.string :jira_board_url
      t.string :jira_project_key
      t.datetime :discarded_at

      t.timestamps
    end
  end
end
