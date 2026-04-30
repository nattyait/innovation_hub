module Api
  module V1
    module Innovation
      class NotificationsController < BaseController
        def index
          notifications = current_user.notifications.recent.limit(30)
          render json: {
            notifications: notifications.map { |n| serialize_notification(n) },
            unread_count: current_user.notifications.unread.count
          }
        end

        def mark_read
          current_user.notifications.unread.update_all(read_at: Time.current)
          head :no_content
        end

        private

        def serialize_notification(n)
          { id: n.id, kind: n.kind, read: n.read_at.present?,
            notifiable_type: n.notifiable_type, notifiable_id: n.notifiable_id,
            created_at: n.created_at }
        end
      end
    end
  end
end
