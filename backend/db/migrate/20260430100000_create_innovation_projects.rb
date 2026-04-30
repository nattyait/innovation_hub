class CreateInnovationProjects < ActiveRecord::Migration[8.1]
  def change
    create_table :innovation_projects do |t|
      t.references :idea,    null: false, foreign_key: true
      t.bigint     :sponsor_id, null: false
      t.string  :title,               null: false
      t.string  :department
      t.text    :summary
      t.text    :expectation
      t.text    :pain_point
      t.text    :improved_process
      t.text    :ai_usage
      t.text    :quantitative_results
      t.text    :qualitative_results
      t.text    :esg_impact
      t.string  :status, default: "planning", null: false
      t.timestamps
    end
    add_foreign_key :innovation_projects, :users, column: :sponsor_id
    add_index :innovation_projects, :sponsor_id
    add_index :innovation_projects, :status

    create_table :innovation_project_members do |t|
      t.references :innovation_project, null: false, foreign_key: true
      t.references :user,               null: false, foreign_key: true
      t.string :role, default: "member", null: false
      t.timestamps
    end
    add_index :innovation_project_members, [:innovation_project_id, :user_id],
              unique: true, name: "idx_project_members_uniq"

    create_table :project_topics do |t|
      t.references :innovation_project, null: false, foreign_key: true
      t.bigint  :author_id, null: false
      t.string  :title,     null: false
      t.text    :body,      null: false
      t.timestamps
    end
    add_foreign_key :project_topics, :users, column: :author_id

    create_table :project_topic_comments do |t|
      t.references :project_topic, null: false, foreign_key: true
      t.bigint  :author_id,  null: false
      t.bigint  :parent_id            # nil = top-level; present = reply
      t.text    :body,       null: false
      t.timestamps
    end
    add_foreign_key :project_topic_comments, :users, column: :author_id
    add_foreign_key :project_topic_comments, :project_topic_comments, column: :parent_id
    add_index :project_topic_comments, :parent_id

    create_table :project_deployments do |t|
      t.references :innovation_project, null: false, foreign_key: true
      t.string  :department_name,       null: false
      t.bigint  :assigned_by_id,        null: false
      t.date    :start_date
      t.date    :end_date
      t.string  :status, default: "not_started", null: false
      t.timestamps
    end
    add_foreign_key :project_deployments, :users, column: :assigned_by_id

    create_table :project_deployment_impacts do |t|
      t.references :project_deployment,  null: false, foreign_key: true
      t.bigint  :reported_by_user_id,    null: false
      t.integer :people_affected,        null: false, default: 0
      t.decimal :time_saved_hours,       precision: 8,  scale: 2
      t.decimal :cost_saved_thb,         precision: 14, scale: 2
      t.string  :impact_type,            null: false, default: "other"
      t.text    :description,            null: false
      t.string  :evidence_url
      t.timestamps
    end
    add_foreign_key :project_deployment_impacts, :users, column: :reported_by_user_id
  end
end
