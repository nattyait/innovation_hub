class RestructureForV2 < ActiveRecord::Migration[8.1]
  def up
    # ── Drop incubator & classroom tables (FK order matters) ──────────────
    drop_table :project_discussions
    drop_table :project_members
    drop_table :project_updates
    drop_table :incubator_projects
    drop_table :classroom_courses

    # ── Users: org-chart manager link + rename project_owner → employee ───
    add_reference :users, :manager, foreign_key: { to_table: :users }, null: true
    execute "UPDATE users SET role = 'employee' WHERE role = 'project_owner'"

    # ── Ideas: remap statuses + add approver + return_reason ──────────────
    execute "UPDATE ideas SET status = 'submitted' WHERE status = 'pending_review'"
    execute "UPDATE ideas SET status = 'approved'  WHERE status = 'incubating'"
    add_reference :ideas, :approver, foreign_key: { to_table: :users }, null: true
    add_column    :ideas, :return_reason, :text

    # ── Comment upvotes ────────────────────────────────────────────────────
    create_table :idea_comment_votes do |t|
      t.references :idea_comment, null: false, foreign_key: true
      t.references :user,         null: false, foreign_key: true
      t.timestamps
    end
    add_index :idea_comment_votes, [:idea_comment_id, :user_id], unique: true

    # ── Idea applications (someone applied this idea in real work) ─────────
    create_table :idea_applications do |t|
      t.references :idea,               null: false, foreign_key: true
      t.bigint     :applied_by_user_id, null: false
      t.string     :department
      t.text       :description,        null: false
      t.timestamps
    end
    add_foreign_key :idea_applications, :users, column: :applied_by_user_id
    add_index :idea_applications, :applied_by_user_id

    # ── Impact reports ─────────────────────────────────────────────────────
    create_table :idea_impacts do |t|
      t.references :idea_application,   null: false, foreign_key: true
      t.bigint  :reported_by_user_id,   null: false
      t.integer :people_affected,       null: false, default: 0
      t.decimal :time_saved_hours,      precision: 8,  scale: 2
      t.decimal :cost_saved_thb,        precision: 14, scale: 2
      t.string  :impact_type,           null: false, default: "other"
      t.text    :description,           null: false
      t.string  :evidence_url
      t.timestamps
    end
    add_foreign_key :idea_impacts, :users, column: :reported_by_user_id
    add_index :idea_impacts, :reported_by_user_id

    # ── Communities (synced from One Krungthai) ────────────────────────────
    create_table :communities do |t|
      t.string   :external_id,  null: false
      t.string   :name,         null: false
      t.text     :description
      t.integer  :member_count, default: 0, null: false
      t.string   :avatar_url
      t.datetime :synced_at
      t.timestamps
    end
    add_index :communities, :external_id, unique: true

    # ── Idea ↔ Community join ──────────────────────────────────────────────
    create_table :idea_community_tags do |t|
      t.references :idea,      null: false, foreign_key: true
      t.references :community, null: false, foreign_key: true
      t.datetime   :created_at, null: false
    end
    add_index :idea_community_tags, [:idea_id, :community_id], unique: true

    # ── Points ledger (append-only) ────────────────────────────────────────
    create_table :innovation_points do |t|
      t.references :user,           null: false, foreign_key: true
      t.integer    :points,         null: false
      t.string     :action_type,    null: false
      t.string     :reference_type
      t.bigint     :reference_id
      t.datetime   :earned_at,      null: false
    end
    add_index :innovation_points, [:reference_type, :reference_id]
    add_index :innovation_points, :earned_at

    # ── Badges ─────────────────────────────────────────────────────────────
    create_table :user_badges do |t|
      t.references :user,          null: false, foreign_key: true
      t.string     :badge_key,     null: false
      t.string     :reference_type
      t.bigint     :reference_id
      t.datetime   :earned_at,     null: false
    end
    add_index :user_badges, [:user_id, :badge_key], unique: true
  end

  def down
    raise ActiveRecord::IrreversibleMigration
  end
end
