class CreateHeartBudgets < ActiveRecord::Migration[8.1]
  def change
    create_table :heart_budgets do |t|
      t.references :user, null: false, foreign_key: true
      t.string :period_label, null: false
      t.integer :total, null: false, default: 10
      t.integer :used, null: false, default: 0
      t.datetime :opened_at, null: false

      t.timestamps
    end
    add_index :heart_budgets, [:user_id, :period_label], unique: true
  end
end
