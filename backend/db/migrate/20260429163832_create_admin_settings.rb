class CreateAdminSettings < ActiveRecord::Migration[8.1]
  def change
    create_table :admin_settings do |t|
      t.string :key
      t.text :value

      t.timestamps
    end
    add_index :admin_settings, :key, unique: true
  end
end
