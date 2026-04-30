Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check

  namespace :api do
    namespace :v1 do
      namespace :innovation do
        # Auth (POC)
        post "sessions",         to: "sessions#create"
        post "sessions/persona", to: "sessions#persona"

        # Public summary (for One Krungthai home feed)
        get "summary",                 to: "summary#index"
        get "summary/trending_ideas",  to: "summary#trending_ideas"
        get "summary/active_projects", to: "summary#active_projects"

        # Ideas
        resources :ideas, only: [:index, :show, :create, :update, :destroy] do
          member { patch :change_status }
          resources :hearts,   only: [:create, :destroy], shallow: true
          resources :comments, only: [:index, :create, :destroy], shallow: true
        end

        # Incubator Projects
        resources :incubator_projects, only: [:index, :show, :update] do
          member { patch :change_status }
          resources :project_updates,     only: [:index, :create], shallow: true
          resources :project_discussions, only: [:index, :create, :destroy], shallow: true
        end

        # Classroom
        resources :classroom_courses, only: [:index, :show]

        # Notifications
        resources :notifications, only: [:index] do
          collection { patch :mark_read }
        end

        # Admin
        namespace :admin do
          resources :ideas, only: [:index, :update, :destroy]
          post  "heart_budgets/open_period", to: "heart_budgets#open_period"
          patch "heart_budgets/settings",    to: "heart_budgets#settings"
        end
      end
    end
  end
end
