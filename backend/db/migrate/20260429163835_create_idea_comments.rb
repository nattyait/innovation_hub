class CreateIdeaComments < ActiveRecord::Migration[8.1]
  def change
    create_table :idea_comments do |t|
      t.references :idea, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.text :body

      t.timestamps
    end
  end
end
