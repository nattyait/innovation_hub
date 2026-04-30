class CreateIdeas < ActiveRecord::Migration[8.1]
  def change
    create_table :ideas do |t|
      t.string :title, null: false
      t.text :body, null: false
      t.string :category
      t.string :status, null: false, default: "draft"
      t.references :author, null: false, foreign_key: { to_table: :users }
      t.string :tags, array: true, default: []
      t.datetime :discarded_at

      t.timestamps
    end
    add_index :ideas, :status
    add_index :ideas, :discarded_at
    add_index :ideas, :category
  end
end
