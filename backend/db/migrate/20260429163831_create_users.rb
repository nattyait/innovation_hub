class CreateUsers < ActiveRecord::Migration[8.1]
  def change
    create_table :users do |t|
      t.string :employee_id
      t.string :name
      t.string :email
      t.string :role
      t.string :password_digest
      t.string :avatar_url

      t.timestamps
    end
    add_index :users, :employee_id, unique: true
    add_index :users, :email, unique: true
  end
end
