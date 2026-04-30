# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_04_30_100000) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_settings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key"
    t.datetime "updated_at", null: false
    t.text "value"
    t.index ["key"], name: "index_admin_settings_on_key", unique: true
  end

  create_table "communities", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.text "description"
    t.string "external_id", null: false
    t.integer "member_count", default: 0, null: false
    t.string "name", null: false
    t.datetime "synced_at"
    t.datetime "updated_at", null: false
    t.index ["external_id"], name: "index_communities_on_external_id", unique: true
  end

  create_table "heart_budgets", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "opened_at", null: false
    t.string "period_label", null: false
    t.integer "total", default: 10, null: false
    t.datetime "updated_at", null: false
    t.integer "used", default: 0, null: false
    t.bigint "user_id", null: false
    t.index ["user_id", "period_label"], name: "index_heart_budgets_on_user_id_and_period_label", unique: true
    t.index ["user_id"], name: "index_heart_budgets_on_user_id"
  end

  create_table "idea_applications", force: :cascade do |t|
    t.bigint "applied_by_user_id", null: false
    t.datetime "created_at", null: false
    t.string "department"
    t.text "description", null: false
    t.bigint "idea_id", null: false
    t.datetime "updated_at", null: false
    t.index ["applied_by_user_id"], name: "index_idea_applications_on_applied_by_user_id"
    t.index ["idea_id"], name: "index_idea_applications_on_idea_id"
  end

  create_table "idea_comment_votes", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "idea_comment_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["idea_comment_id", "user_id"], name: "index_idea_comment_votes_on_idea_comment_id_and_user_id", unique: true
    t.index ["idea_comment_id"], name: "index_idea_comment_votes_on_idea_comment_id"
    t.index ["user_id"], name: "index_idea_comment_votes_on_user_id"
  end

  create_table "idea_comments", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.bigint "idea_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["idea_id"], name: "index_idea_comments_on_idea_id"
    t.index ["user_id"], name: "index_idea_comments_on_user_id"
  end

  create_table "idea_community_tags", force: :cascade do |t|
    t.bigint "community_id", null: false
    t.datetime "created_at", null: false
    t.bigint "idea_id", null: false
    t.index ["community_id"], name: "index_idea_community_tags_on_community_id"
    t.index ["idea_id", "community_id"], name: "index_idea_community_tags_on_idea_id_and_community_id", unique: true
    t.index ["idea_id"], name: "index_idea_community_tags_on_idea_id"
  end

  create_table "idea_hearts", force: :cascade do |t|
    t.text "comment"
    t.datetime "created_at", null: false
    t.bigint "idea_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["idea_id", "user_id"], name: "index_idea_hearts_on_idea_id_and_user_id", unique: true
    t.index ["idea_id"], name: "index_idea_hearts_on_idea_id"
    t.index ["user_id"], name: "index_idea_hearts_on_user_id"
  end

  create_table "idea_impacts", force: :cascade do |t|
    t.decimal "cost_saved_thb", precision: 14, scale: 2
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.string "evidence_url"
    t.bigint "idea_application_id", null: false
    t.string "impact_type", default: "other", null: false
    t.integer "people_affected", default: 0, null: false
    t.bigint "reported_by_user_id", null: false
    t.decimal "time_saved_hours", precision: 8, scale: 2
    t.datetime "updated_at", null: false
    t.index ["idea_application_id"], name: "index_idea_impacts_on_idea_application_id"
    t.index ["reported_by_user_id"], name: "index_idea_impacts_on_reported_by_user_id"
  end

  create_table "ideas", force: :cascade do |t|
    t.bigint "approver_id"
    t.bigint "author_id", null: false
    t.text "body", null: false
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.text "return_reason"
    t.string "status", default: "draft", null: false
    t.string "tags", default: [], array: true
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["approver_id"], name: "index_ideas_on_approver_id"
    t.index ["author_id"], name: "index_ideas_on_author_id"
    t.index ["category"], name: "index_ideas_on_category"
    t.index ["discarded_at"], name: "index_ideas_on_discarded_at"
    t.index ["status"], name: "index_ideas_on_status"
  end

  create_table "innovation_points", force: :cascade do |t|
    t.string "action_type", null: false
    t.datetime "earned_at", null: false
    t.integer "points", null: false
    t.bigint "reference_id"
    t.string "reference_type"
    t.bigint "user_id", null: false
    t.index ["earned_at"], name: "index_innovation_points_on_earned_at"
    t.index ["reference_type", "reference_id"], name: "index_innovation_points_on_reference_type_and_reference_id"
    t.index ["user_id"], name: "index_innovation_points_on_user_id"
  end

  create_table "innovation_project_members", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "innovation_project_id", null: false
    t.string "role", default: "member", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["innovation_project_id", "user_id"], name: "idx_project_members_uniq", unique: true
    t.index ["innovation_project_id"], name: "index_innovation_project_members_on_innovation_project_id"
    t.index ["user_id"], name: "index_innovation_project_members_on_user_id"
  end

  create_table "innovation_projects", force: :cascade do |t|
    t.text "ai_usage"
    t.datetime "created_at", null: false
    t.string "department"
    t.text "esg_impact"
    t.text "expectation"
    t.bigint "idea_id", null: false
    t.text "improved_process"
    t.text "pain_point"
    t.text "qualitative_results"
    t.text "quantitative_results"
    t.bigint "sponsor_id", null: false
    t.string "status", default: "planning", null: false
    t.text "summary"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["idea_id"], name: "index_innovation_projects_on_idea_id"
    t.index ["sponsor_id"], name: "index_innovation_projects_on_sponsor_id"
    t.index ["status"], name: "index_innovation_projects_on_status"
  end

  create_table "notifications", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "kind", null: false
    t.bigint "notifiable_id", null: false
    t.string "notifiable_type", null: false
    t.datetime "read_at"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["notifiable_type", "notifiable_id"], name: "index_notifications_on_notifiable_type_and_notifiable_id"
    t.index ["user_id", "read_at"], name: "index_notifications_on_user_id_and_read_at"
    t.index ["user_id"], name: "index_notifications_on_user_id"
  end

  create_table "project_deployment_impacts", force: :cascade do |t|
    t.decimal "cost_saved_thb", precision: 14, scale: 2
    t.datetime "created_at", null: false
    t.text "description", null: false
    t.string "evidence_url"
    t.string "impact_type", default: "other", null: false
    t.integer "people_affected", default: 0, null: false
    t.bigint "project_deployment_id", null: false
    t.bigint "reported_by_user_id", null: false
    t.decimal "time_saved_hours", precision: 8, scale: 2
    t.datetime "updated_at", null: false
    t.index ["project_deployment_id"], name: "index_project_deployment_impacts_on_project_deployment_id"
  end

  create_table "project_deployments", force: :cascade do |t|
    t.bigint "assigned_by_id", null: false
    t.datetime "created_at", null: false
    t.string "department_name", null: false
    t.date "end_date"
    t.bigint "innovation_project_id", null: false
    t.date "start_date"
    t.string "status", default: "not_started", null: false
    t.datetime "updated_at", null: false
    t.index ["innovation_project_id"], name: "index_project_deployments_on_innovation_project_id"
  end

  create_table "project_topic_comments", force: :cascade do |t|
    t.bigint "author_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.bigint "parent_id"
    t.bigint "project_topic_id", null: false
    t.datetime "updated_at", null: false
    t.index ["parent_id"], name: "index_project_topic_comments_on_parent_id"
    t.index ["project_topic_id"], name: "index_project_topic_comments_on_project_topic_id"
  end

  create_table "project_topics", force: :cascade do |t|
    t.bigint "author_id", null: false
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.bigint "innovation_project_id", null: false
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["innovation_project_id"], name: "index_project_topics_on_innovation_project_id"
  end

  create_table "user_badges", force: :cascade do |t|
    t.string "badge_key", null: false
    t.datetime "earned_at", null: false
    t.bigint "reference_id"
    t.string "reference_type"
    t.bigint "user_id", null: false
    t.index ["user_id", "badge_key"], name: "index_user_badges_on_user_id_and_badge_key", unique: true
    t.index ["user_id"], name: "index_user_badges_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "employee_id"
    t.bigint "manager_id"
    t.string "name"
    t.string "password_digest"
    t.string "role"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["employee_id"], name: "index_users_on_employee_id", unique: true
    t.index ["manager_id"], name: "index_users_on_manager_id"
  end

  add_foreign_key "heart_budgets", "users"
  add_foreign_key "idea_applications", "ideas"
  add_foreign_key "idea_applications", "users", column: "applied_by_user_id"
  add_foreign_key "idea_comment_votes", "idea_comments"
  add_foreign_key "idea_comment_votes", "users"
  add_foreign_key "idea_comments", "ideas"
  add_foreign_key "idea_comments", "users"
  add_foreign_key "idea_community_tags", "communities"
  add_foreign_key "idea_community_tags", "ideas"
  add_foreign_key "idea_hearts", "ideas"
  add_foreign_key "idea_hearts", "users"
  add_foreign_key "idea_impacts", "idea_applications"
  add_foreign_key "idea_impacts", "users", column: "reported_by_user_id"
  add_foreign_key "ideas", "users", column: "approver_id"
  add_foreign_key "ideas", "users", column: "author_id"
  add_foreign_key "innovation_points", "users"
  add_foreign_key "innovation_project_members", "innovation_projects"
  add_foreign_key "innovation_project_members", "users"
  add_foreign_key "innovation_projects", "ideas"
  add_foreign_key "innovation_projects", "users", column: "sponsor_id"
  add_foreign_key "notifications", "users"
  add_foreign_key "project_deployment_impacts", "project_deployments"
  add_foreign_key "project_deployment_impacts", "users", column: "reported_by_user_id"
  add_foreign_key "project_deployments", "innovation_projects"
  add_foreign_key "project_deployments", "users", column: "assigned_by_id"
  add_foreign_key "project_topic_comments", "project_topic_comments", column: "parent_id"
  add_foreign_key "project_topic_comments", "project_topics"
  add_foreign_key "project_topic_comments", "users", column: "author_id"
  add_foreign_key "project_topics", "innovation_projects"
  add_foreign_key "project_topics", "users", column: "author_id"
  add_foreign_key "user_badges", "users"
  add_foreign_key "users", "users", column: "manager_id"
end
