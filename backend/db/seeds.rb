puts "Seeding Innovation Hub v2..."

AdminSetting.set("heart_budget_amount", 10)

# ── Users (org chart stub: manager is direct manager of both employees) ────
# find_or_create_by! + update! ensures existing records are always in sync
manager = User.find_or_create_by!(email: "manager@ktb.poc") { |u| u.password = "password123" }
manager.update!(employee_id: "MGR001", name: "วิภา ผู้จัดการ", role: "manager")

admin = User.find_or_create_by!(email: "admin@ktb.poc") { |u| u.password = "password123" }
admin.update!(employee_id: "ADM001", name: "ธนา แอดมิน", role: "admin")

sponsor = User.find_or_create_by!(email: "sponsor@ktb.poc") { |u| u.password = "password123" }
sponsor.update!(employee_id: "SPO001", name: "สมชัย สปอนเซอร์", role: "sponsor")

employee1 = User.find_or_create_by!(email: "employee@ktb.poc") { |u| u.password = "password123" }
employee1.update!(employee_id: "EMP001", name: "สมชาย พนักงาน", role: "employee", manager: manager)

employee2 = User.find_or_create_by!(email: "employee2@ktb.poc") { |u| u.password = "password123" }
employee2.update!(employee_id: "EMP002", name: "นภา พนักงาน", role: "employee", manager: manager)

# Remove leftover persona from old seeds
User.find_by(email: "project_owner@ktb.poc")&.destroy

HeartBudgetService.open_new_period

# ── Communities (stub: would sync from One Krungthai community API) ────────
communities_data = [
  { external_id: "COM001", name: "Digital Innovation",         description: "นวัตกรรมดิจิทัลและเทคโนโลยี",    member_count: 142 },
  { external_id: "COM002", name: "Lean & Process Improvement", description: "การปรับปรุงกระบวนการและ Lean",    member_count: 98  },
  { external_id: "COM003", name: "Customer Experience",        description: "ยกระดับประสบการณ์ลูกค้า",        member_count: 201 },
  { external_id: "COM004", name: "ESG & Sustainability",       description: "สิ่งแวดล้อมและความยั่งยืน",        member_count: 77  },
  { external_id: "COM005", name: "People & Culture",           description: "การพัฒนาคนและวัฒนธรรมองค์กร",    member_count: 165 },
]
digital, lean, cx, esg, people_culture = communities_data.map do |attrs|
  Community.find_or_create_by!(external_id: attrs[:external_id]) do |c|
    c.assign_attributes(attrs.merge(synced_at: Time.current))
  end
end

# ── Ideas ──────────────────────────────────────────────────────────────────
ideas_data = [
  { title: "AI Chatbot ช่วยลูกค้าธนาคาร 24/7",
    body: "พัฒนา AI Chatbot ตอบคำถามลูกค้าตลอด 24 ชั่วโมง รองรับภาษาไทยและอังกฤษ ลดภาระ Call Center",
    category: "technology", status: "approved", tags: ["AI", "automation"],
    author: employee1, communities: [digital, cx] },
  { title: "Paperless สาขา — ลดการใช้กระดาษ 90%",
    body: "แทนที่เอกสารกระดาษด้วย e-Form ทุกประเภท ผ่าน Tablet ที่สาขา",
    category: "process", status: "approved", tags: ["green", "digital"],
    author: employee1, communities: [lean, esg] },
  { title: "Gamification การเรียนรู้พนักงาน",
    body: "เพิ่มระบบ Gamification ใน E-Training มี Badge และ Leaderboard เพื่อกระตุ้นการเรียนรู้",
    category: "culture", status: "approved", tags: ["HR", "learning"],
    author: employee2, communities: [people_culture, digital] },
  { title: "Smart Queue ลดเวลารอสาขา",
    body: "ระบบจองคิวล่วงหน้าผ่าน App แสดงเวลารอ Real-time ลดเวลารอเหลือ < 10 นาที",
    category: "customer", status: "approved", tags: ["UX", "branch"],
    author: employee2, communities: [cx] },
  { title: "Carbon Footprint Tracker สำหรับพนักงาน",
    body: "App ติดตาม Carbon Footprint ส่วนตัว เชื่อมกับข้อมูลการเดินทางและค่าไฟ",
    category: "culture", status: "under_review", tags: ["ESG", "sustainability"],
    author: employee1, communities: [esg] },
  { title: "Micro-learning 5 นาทีต่อวัน",
    body: "Content การเรียนรู้สั้นๆ 5 นาที ส่งผ่าน LINE Notify ทุกเช้า",
    category: "culture", status: "draft", tags: ["learning", "micro"],
    author: employee1, communities: [] },
]

created_ideas = ideas_data.map do |attrs|
  idea = Idea.find_or_create_by!(title: attrs[:title]) do |i|
    i.body     = attrs[:body]
    i.category = attrs[:category]
    i.status   = attrs[:status]
    i.tags     = attrs[:tags]
    i.author   = attrs[:author]
    i.approver = manager if %w[approved under_review returned submitted].include?(attrs[:status])
  end
  attrs[:communities].each { |c| idea.idea_community_tags.find_or_create_by!(community: c) }
  idea
end

# ── Hearts ─────────────────────────────────────────────────────────────────
created_ideas.select(&:approved?).each do |idea|
  [employee1, employee2, sponsor].each do |user|
    next if idea.author == user
    next if idea.idea_hearts.exists?(user: user)
    idea.idea_hearts.create!(user: user, comment: "ไอเดียดีมาก!")
  end
end

# ── Comments + upvotes ─────────────────────────────────────────────────────
ai_idea = created_ideas.first
unless ai_idea.idea_comments.exists?
  c1 = ai_idea.idea_comments.create!(user: employee2, body: "ควรรองรับ multimodal ทั้ง text และ voice ด้วยครับ")
  c2 = ai_idea.idea_comments.create!(user: manager,   body: "ต้องผ่าน IT security review ก่อนนำ AI เข้า production นะครับ")
  c1.idea_comment_votes.find_or_create_by!(user: employee1)
  c1.idea_comment_votes.find_or_create_by!(user: manager)
  c2.idea_comment_votes.find_or_create_by!(user: employee1)
  c2.idea_comment_votes.find_or_create_by!(user: employee2)
end

# ── Idea Application + Impact ──────────────────────────────────────────────
paperless = created_ideas.find { |i| i.title.include?("Paperless") }
unless IdeaApplication.exists?
  app = IdeaApplication.create!(
    idea: paperless, applied_by_user_id: employee2.id,
    department: "สาขาสีลม",
    description: "นำ e-Form มาใช้แทนเอกสารกระดาษในขั้นตอน KYC ของสาขาสีลม"
  )
  IdeaImpact.create!(
    idea_application: app, reported_by_user_id: employee2.id,
    people_affected: 450, time_saved_hours: 2.5,
    cost_saved_thb: 12_000, impact_type: "cost",
    description: "ลดค่าใช้จ่ายกระดาษและจัดเก็บเอกสาร ลูกค้า 450 คน/เดือน ประหยัดเวลาต่อคน ~15 นาที"
  )
end

# ── Points (ledger entries, normally written by PointsService) ────────────
unless InnovationPoint.exists?
  [
    { user: employee1, points: 20, action_type: "idea_approved",       reference_type: "Idea", reference_id: created_ideas[0].id },
    { user: employee1, points: 30, action_type: "idea_applied_by_others", reference_type: "Idea", reference_id: paperless.id },
    { user: employee2, points: 15, action_type: "impact_reported",     reference_type: "IdeaApplication", reference_id: IdeaApplication.first&.id },
    { user: employee2, points: 10, action_type: "first_adopter_bonus", reference_type: "Idea", reference_id: paperless.id },
    { user: employee2, points: 3,  action_type: "comment_upvoted",     reference_type: "IdeaComment", reference_id: ai_idea.idea_comments.first&.id },
  ].each do |attrs|
    InnovationPoint.create!(attrs.merge(earned_at: Time.current))
  end
end

# ── Badges ─────────────────────────────────────────────────────────────────
UserBadge.find_or_create_by!(user: employee1, badge_key: "approved_innovator") { |b| b.earned_at = Time.current }
UserBadge.find_or_create_by!(user: employee2, badge_key: "impact_maker")       { |b| b.earned_at = Time.current }
UserBadge.find_or_create_by!(user: employee2, badge_key: "first_idea")         { |b| b.earned_at = Time.current }

puts "Done!"
puts "  #{User.count} users  |  #{Idea.count} ideas  |  #{IdeaHeart.count} hearts"
puts "  #{Community.count} communities  |  #{IdeaApplication.count} applications  |  #{IdeaImpact.count} impacts"
puts "  #{InnovationPoint.count} point entries  |  #{UserBadge.count} badges"
puts ""
puts "  Personas (password: password123):"
puts "    employee@ktb.poc   manager@ktb.poc   admin@ktb.poc   sponsor@ktb.poc"
