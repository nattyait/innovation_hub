puts "Seeding Innovation Hub POC data..."

AdminSetting.set("heart_budget_amount", 10)

personas = [
  { employee_id: "EMP001", name: "สมชาย พนักงาน",      email: "employee@ktb.poc",      role: "employee",      password: "password123" },
  { employee_id: "ADM001", name: "วิภา แอดมิน",         email: "admin@ktb.poc",         role: "admin",         password: "password123" },
  { employee_id: "SPO001", name: "ธนา สปอนเซอร์",       email: "sponsor@ktb.poc",       role: "sponsor",       password: "password123" },
  { employee_id: "PRJ001", name: "ปิยะ เจ้าของโปรเจค", email: "project_owner@ktb.poc", role: "project_owner", password: "password123" }
]

users = personas.map do |attrs|
  User.find_or_create_by!(email: attrs[:email]) do |u|
    u.employee_id = attrs[:employee_id]
    u.name        = attrs[:name]
    u.role        = attrs[:role]
    u.password    = attrs[:password]
  end
end

employee, admin, sponsor, project_owner = users

HeartBudgetService.open_new_period

ideas_data = [
  { title: "AI Chatbot ช่วยลูกค้าธนาคาร 24/7",
    body: "พัฒนา AI Chatbot ที่สามารถตอบคำถามลูกค้าได้ตลอด 24 ชั่วโมง รองรับภาษาไทยและภาษาอังกฤษ ลดภาระ Call Center",
    category: "technology", status: "approved",       tags: ["AI", "customer", "automation"], author: employee },
  { title: "Paperless สาขา — ลดการใช้กระดาษ 90%",
    body: "แทนที่เอกสารกระดาษด้วย e-Form ทุกประเภท ทั้ง KYC, การเปิดบัญชี, การกู้เงิน ผ่าน Tablet ที่สาขา",
    category: "process",     status: "approved",       tags: ["green", "digital", "UX"],     author: employee },
  { title: "Gamification การเรียนรู้พนักงาน",
    body: "เพิ่มระบบ Gamification ใน E-Training เพื่อกระตุ้นให้พนักงานเรียนรู้มากขึ้น โดยมีแต้ม Badge และ Leaderboard",
    category: "culture",     status: "approved",       tags: ["HR", "learning", "engagement"], author: project_owner },
  { title: "Smart Queue ลดเวลารอสาขา",
    body: "ระบบจองคิวล่วงหน้าผ่าน App และแสดงเวลารอจริงแบบ Real-time ลดเวลารอที่สาขาให้เหลือไม่เกิน 10 นาที",
    category: "customer",    status: "incubating",     tags: ["UX", "branch", "queue"],      author: project_owner },
  { title: "Carbon Footprint Tracker สำหรับพนักงาน",
    body: "App ติดตาม Carbon Footprint ส่วนตัวของพนักงาน เชื่อมกับข้อมูลการเดินทาง ค่าไฟ และการใช้ทรัพยากร",
    category: "culture",     status: "pending_review", tags: ["ESG", "green", "sustainability"], author: employee },
  { title: "Micro-learning 5 นาทีต่อวัน",
    body: "Content การเรียนรู้สั้นๆ 5 นาที ส่งผ่าน LINE Notify ทุกเช้า เนื้อหาเกี่ยวกับ Finance, Tech และ Soft Skills",
    category: "culture",     status: "draft",          tags: ["learning", "micro"],          author: employee }
]

created_ideas = ideas_data.map do |attrs|
  Idea.find_or_create_by!(title: attrs[:title]) do |i|
    i.body     = attrs[:body]
    i.category = attrs[:category]
    i.status   = attrs[:status]
    i.tags     = attrs[:tags]
    i.author   = attrs[:author]
  end
end

created_ideas.select(&:approved?).first(3).each do |idea|
  [employee, sponsor].each do |user|
    next if idea.idea_hearts.exists?(user: user)
    idea.idea_hearts.create!(user: user, comment: "ไอเดียดีมาก น่าลงทุน!")
  end
end

smart_queue = Idea.find_by!(title: "Smart Queue ลดเวลารอสาขา")
unless IncubatorProject.exists?
  project = IncubatorProject.create!(
    idea:             smart_queue,
    title:            "Smart Queue Project",
    summary:          "โปรเจค Smart Queue เพื่อลดเวลารอที่สาขา เป้าหมาย: ลดเวลารอเหลือ < 10 นาที ภายใน Q3",
    status:           "mvp",
    jira_board_url:   "https://jira.example.com/boards/SQ",
    jira_project_key: "SQ"
  )
  ProjectMember.create!(incubator_project: project, user: project_owner, role: "owner")
  ProjectMember.create!(incubator_project: project, user: employee,      role: "member")
  ProjectUpdate.create!(incubator_project: project, user: project_owner,
    body: "เริ่มต้น Sprint แรก: วิเคราะห์ระบบ Queue ที่มีอยู่ และออกแบบ UX สำหรับการจองคิวล่วงหน้า",
    milestone_tag: "milestone")
  ProjectUpdate.create!(incubator_project: project, user: project_owner,
    body: "ทีมเสร็จสิ้น MVP ทดสอบที่สาขานำร่อง 3 สาขา รอผล Feedback",
    milestone_tag: "achievement")
end

[
  { sf_course_id: "SF001", title: "Design Thinking สำหรับนวัตกรรม",
    description: "เรียนรู้กระบวนการ Design Thinking เพื่อสร้างนวัตกรรมที่ตอบโจทย์ลูกค้า",
    category: "innovation", duration_minutes: 90,
    thumbnail_url: "https://placehold.co/400x200?text=Design+Thinking",
    deep_link_url: "https://successfactors.example.com/courses/SF001" },
  { sf_course_id: "SF002", title: "Lean Startup — จาก Idea สู่ Product",
    description: "หลักการ Lean Startup, MVP, Build-Measure-Learn Loop",
    category: "startup", duration_minutes: 120,
    thumbnail_url: "https://placehold.co/400x200?text=Lean+Startup",
    deep_link_url: "https://successfactors.example.com/courses/SF002" },
  { sf_course_id: "SF003", title: "Pitching & Storytelling สำหรับไอเดียธุรกิจ",
    description: "เทคนิคการนำเสนอไอเดียให้น่าสนใจ สร้าง Story ที่ทรงพลัง",
    category: "skills", duration_minutes: 60,
    thumbnail_url: "https://placehold.co/400x200?text=Pitching",
    deep_link_url: "https://successfactors.example.com/courses/SF003" },
  { sf_course_id: "SF004", title: "Agile & Scrum สำหรับทีมนวัตกรรม",
    description: "การทำงานแบบ Agile และ Scrum framework สำหรับโปรเจคนวัตกรรม",
    category: "startup", duration_minutes: 150,
    thumbnail_url: "https://placehold.co/400x200?text=Agile+Scrum",
    deep_link_url: "https://successfactors.example.com/courses/SF004" }
].each do |attrs|
  ClassroomCourse.find_or_create_by!(sf_course_id: attrs[:sf_course_id]) do |c|
    c.assign_attributes(attrs.except(:sf_course_id))
  end
end

puts "Done!"
puts "  #{User.count} users  |  #{Idea.count} ideas  |  #{IdeaHeart.count} hearts"
puts "  #{IncubatorProject.count} projects  |  #{ClassroomCourse.count} courses"
puts "  Personas: employee / admin / sponsor / project_owner — password: password123"
