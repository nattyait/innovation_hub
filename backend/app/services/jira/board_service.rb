# POC stub — returns placeholder data.
# Production: replace with Jira REST API v3 client.
module Jira
  class BoardService
    def self.summary(_project_key)
      { open_issues: nil, current_sprint: nil, board_url: nil }
    end
  end
end
