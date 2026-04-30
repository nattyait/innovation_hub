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

ActiveRecord::Schema[8.1].define(version: 2026_04_29_181535) do
  # These are extensions that must be enabled in order to support this database
  enable_extension "pg_catalog.plpgsql"

  create_table "admin_settings", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.string "key"
    t.datetime "updated_at", null: false
    t.text "value"
    t.index ["key"], name: "index_admin_settings_on_key", unique: true
  end

  create_table "classroom_courses", force: :cascade do |t|
    t.string "category"
    t.datetime "created_at", null: false
    t.string "deep_link_url"
    t.text "description"
    t.integer "duration_minutes"
    t.string "sf_course_id"
    t.string "thumbnail_url"
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["category"], name: "index_classroom_courses_on_category"
    t.index ["sf_course_id"], name: "index_classroom_courses_on_sf_course_id", unique: true
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

  create_table "idea_comments", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.bigint "idea_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["idea_id"], name: "index_idea_comments_on_idea_id"
    t.index ["user_id"], name: "index_idea_comments_on_user_id"
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

  create_table "ideas", force: :cascade do |t|
    t.bigint "author_id", null: false
    t.text "body", null: false
    t.string "category"
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.string "status", default: "draft", null: false
    t.string "tags", default: [], array: true
    t.string "title", null: false
    t.datetime "updated_at", null: false
    t.index ["author_id"], name: "index_ideas_on_author_id"
    t.index ["category"], name: "index_ideas_on_category"
    t.index ["discarded_at"], name: "index_ideas_on_discarded_at"
    t.index ["status"], name: "index_ideas_on_status"
  end

  create_table "incubator_projects", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.datetime "discarded_at"
    t.bigint "idea_id", null: false
    t.string "jira_board_url"
    t.string "jira_project_key"
    t.string "status"
    t.text "summary"
    t.string "title"
    t.datetime "updated_at", null: false
    t.index ["idea_id"], name: "index_incubator_projects_on_idea_id"
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

  create_table "project_discussions", force: :cascade do |t|
    t.text "body", null: false
    t.datetime "created_at", null: false
    t.bigint "incubator_project_id", null: false
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["incubator_project_id", "created_at"], name: "idx_on_incubator_project_id_created_at_2afd6aca7d"
    t.index ["incubator_project_id"], name: "index_project_discussions_on_incubator_project_id"
    t.index ["user_id"], name: "index_project_discussions_on_user_id"
  end

  create_table "project_members", force: :cascade do |t|
    t.datetime "created_at", null: false
    t.bigint "incubator_project_id", null: false
    t.string "role"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["incubator_project_id"], name: "index_project_members_on_incubator_project_id"
    t.index ["user_id"], name: "index_project_members_on_user_id"
  end

  create_table "project_updates", force: :cascade do |t|
    t.text "body"
    t.datetime "created_at", null: false
    t.bigint "incubator_project_id", null: false
    t.string "milestone_tag"
    t.datetime "updated_at", null: false
    t.bigint "user_id", null: false
    t.index ["incubator_project_id"], name: "index_project_updates_on_incubator_project_id"
    t.index ["user_id"], name: "index_project_updates_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "avatar_url"
    t.datetime "created_at", null: false
    t.string "email"
    t.string "employee_id"
    t.string "name"
    t.string "password_digest"
    t.string "role"
    t.datetime "updated_at", null: false
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["employee_id"], name: "index_users_on_employee_id", unique: true
  end

  add_foreign_key "heart_budgets", "users"
  add_foreign_key "idea_comments", "ideas"
  add_foreign_key "idea_comments", "users"
  add_foreign_key "idea_hearts", "ideas"
  add_foreign_key "idea_hearts", "users"
  add_foreign_key "ideas", "users", column: "author_id"
  add_foreign_key "incubator_projects", "ideas"
  add_foreign_key "notifications", "users"
  add_foreign_key "project_discussions", "incubator_projects"
  add_foreign_key "project_discussions", "users"
  add_foreign_key "project_members", "incubator_projects"
  add_foreign_key "project_members", "users"
  add_foreign_key "project_updates", "incubator_projects"
  add_foreign_key "project_updates", "users"
end
