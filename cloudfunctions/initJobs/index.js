// 云函数入口文件
const cloud = require('wx-server-sdk')
cloud.init({ env: 'cloud1-3g3q2srz04d1d705' })
const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()
  const openid = wxContext.OPENID

  try {
    // 权限校验：仅管理员可执行初始化
    const userRes = await db.collection('users')
      .where({ _openid: openid, userType: 'admin' })
      .limit(1)
      .get()
    if (!userRes.data || userRes.data.length === 0) {
      return { code: 403, message: '无权限：仅管理员可初始化数据' }
    }

    const results = { users: 0, jobs: 0, applications: 0, notifications: 0 }

    // ============ 1. 清空原有数据 ============
    const collections = ['jobs', 'users', 'applications', 'notifications', 'favorites', 'userActions']
    for (const col of collections) {
      const docs = await db.collection(col).limit(100).get()
      for (const doc of docs.data) {
        await db.collection(col).doc(doc._id).remove()
      }
    }

    // ============ 2. 插入用户数据 ============
    const now = db.serverDate()

    // 校友用户
    const alumni = [
      { nickName: '李明远', userType: 'alumni', isVerified: true, avatarUrl: '', profile: { alumni: { graduationYear: 2010, company: '蓝天科技股份有限公司', department: '计算机科学与技术系' } } },
      { nickName: '王芳华', userType: 'alumni', isVerified: true, avatarUrl: '', profile: { alumni: { graduationYear: 2012, company: '启航教育集团', department: '外国语言文学系' } } },
      { nickName: '陈志强', userType: 'alumni', isVerified: true, avatarUrl: '', profile: { alumni: { graduationYear: 2008, company: '新思路咨询有限公司', department: '经济管理学院' } } },
      { nickName: '张文博', userType: 'alumni', isVerified: true, avatarUrl: '', profile: { alumni: { graduationYear: 2015, company: '科技创新有限公司', department: '计算机科学与技术系' } } },
      { nickName: '林小雨', userType: 'alumni', isVerified: true, avatarUrl: '', profile: { alumni: { graduationYear: 2013, company: '未来科技集团', department: '物理学院' } } },
      { nickName: '姚经理', userType: 'alumni', isVerified: true, avatarUrl: '', profile: { alumni: { graduationYear: 2011, company: '示例科技有限公司', department: '软件工程系' } } }
    ]

    // 教师用户
    const teachers = [
      { nickName: '张教授', userType: 'teacher', isVerified: true, avatarUrl: '', profile: { teacher: { department: '软件学院', title: '副教授' } } },
      { nickName: '李教授', userType: 'teacher', isVerified: true, avatarUrl: '', profile: { teacher: { department: '计算机学院', title: '教授' } } },
      { nickName: '王教授', userType: 'teacher', isVerified: true, avatarUrl: '', profile: { teacher: { department: '商学院', title: '讲师' } } },
      { nickName: '陈国', userType: 'teacher', isVerified: true, avatarUrl: '', profile: { teacher: { department: '软件学院', title: '讲师' } } }
    ]

    // 学生用户
    const students = [
      { nickName: '赵雪', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { department: '计算机科学与技术系', major: '软件工程', class: '计算机2001班' } } },
      { nickName: '孙鹏', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { department: '电子信息工程学院', major: '通信工程', class: '电信2001班' } } },
      { nickName: '周琳', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { department: '计算机科学与技术系', major: '人工智能', class: '计算机2002班' } } },
      { nickName: '李明宇', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { department: '软件工程系', major: '软件工程', class: '软件工程2001班' } } },
      { nickName: '张三', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { department: '计算机科学与技术系', major: '软件工程', class: '计算机2001班' } } },
      { nickName: '李四', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { department: '软件工程系', major: '软件工程', class: '软件工程2001班' } } },
      { nickName: '贾明', userType: 'student', isVerified: false, avatarUrl: '', profile: { student: { studentId: '2202203321', department: '软件与物联网工程学院', major: '软件工程', class: '软件工程223班' } } }
    ]

    const insertedUsers = {}
    const allUsers = [
      ...alumni.map(u => ({ ...u, _openid: 'seed_alumni_' + u.nickName, createTime: now, updateTime: now })),
      ...teachers.map(u => ({ ...u, _openid: 'seed_teacher_' + u.nickName, userType: 'teacher', createTime: now, updateTime: now })),
      ...students.map(u => ({ ...u, _openid: 'seed_student_' + u.nickName, userType: 'student', createTime: now, updateTime: now }))
    ]

    for (const user of allUsers) {
      const res = await db.collection('users').add({ data: user })
      insertedUsers[user.nickName] = { _id: res._id, _openid: user._openid, userType: user.userType }
      results.users++
    }

    // ============ 3. 插入职位数据 ============
    const jobs = [
      {
        title: '前端开发工程师',
        salary: '15K-25K',
        company: '示例科技有限公司',
        location: '北京市朝阳区',
        date: '2024-03-20',
        tags: ['React', 'Vue', '小程序'],
        publisherId: insertedUsers['姚经理']._openid,
        publisher: { name: '姚经理', tag: '校友', openid: insertedUsers['姚经理']._openid },
        reviewer: { name: '张教授', tag: '老师' },
        likeCount: 42,
        applicationCount: 28,
        status: 'published',
        description: '负责公司前端项目开发，使用React/Vue技术栈，参与小程序开发。',
        requirements: '熟练掌握HTML/CSS/JavaScript，熟悉React或Vue框架，有小程序开发经验优先。',
        recommenderComment: '好处：\n技术栈主流且更新快，进来能系统学习现代前端工程化体系，React和Vue都能接触；\n团队有资深前端架构师带，成长曲线很陡；\n公司业务扩张期，晋升机会多。\n\n但也真诚说下劝退项：\n需求迭代节奏快，偶尔需要加班赶版本；小程序端兼容性问题比较磨人。',
        createTime: now
      },
      {
        title: '后端开发工程师',
        salary: '20K-35K',
        company: '云智科技有限公司',
        location: '上海市浦东新区',
        date: '2024-03-18',
        tags: ['Java', 'Spring Boot', '微服务'],
        publisherId: insertedUsers['李明远']._openid,
        publisher: { name: '李明远', tag: '校友', openid: insertedUsers['李明远']._openid },
        reviewer: { name: '李教授', tag: '老师' },
        likeCount: 38,
        applicationCount: 22,
        status: 'published',
        description: '负责后端微服务架构设计和开发，保障系统高可用。',
        requirements: '3年以上Java开发经验，熟悉Spring Boot和微服务架构，有分布式系统经验。',
        recommenderComment: '好处：\n微服务架构做得比较规范，进来能把分布式系统的坑踩一遍，技术提升很大；\n团队技术氛围好，每周有技术分享，鼓励参与开源；\n薪资在上海同级别中偏上。\n\n但也真诚说下劝退项：\n微服务体系庞大，新人上手周期较长，前期会比较吃力；\n线上问题排查需要轮值，偶尔半夜被叫起来。',
        createTime: now
      },
      {
        title: '产品经理',
        salary: '18K-30K',
        company: '创新互联网公司',
        location: '深圳市南山区',
        date: '2024-03-15',
        tags: ['用户增长', '数据分析', '产品设计'],
        publisherId: insertedUsers['王芳华']._openid,
        publisher: { name: '王芳华', tag: '校友', openid: insertedUsers['王芳华']._openid },
        reviewer: { name: '王教授', tag: '老师' },
        likeCount: 34,
        applicationCount: 19,
        status: 'published',
        description: '负责产品规划和设计，推动用户增长，进行数据驱动决策。',
        requirements: '2年以上产品经理经验，具备数据分析能力，有B端产品经验优先。',
        recommenderComment: '好处：\n公司重视产品驱动，PM话语权很大，能真正影响产品走向；\n数据驱动文化深入，能积累扎实的数据分析方法论；\n扁平管理，和CEO直接汇报的机会很多。\n\n但也真诚说下劝退项：\nB端产品逻辑复杂，需要花大量时间理解业务；\n需求评审经常和开发拉锯，沟通成本较高。',
        createTime: now
      },
      {
        title: '数据分析师',
        salary: '15K-25K',
        company: '数据智能科技有限公司',
        location: '杭州市西湖区',
        date: '2024-03-12',
        tags: ['Python', 'SQL', '数据建模'],
        publisherId: insertedUsers['陈志强']._openid,
        publisher: { name: '陈志强', tag: '校友', openid: insertedUsers['陈志强']._openid },
        reviewer: { name: '王教授', tag: '老师' },
        likeCount: 25,
        applicationCount: 12,
        status: 'published',
        description: '负责业务数据分析，构建数据模型，为决策提供数据支持。',
        requirements: '熟练使用Python/SQL，了解常用数据建模方法，有数据可视化经验优先。',
        recommenderComment: '好处：\n公司数据基建完善，不用自己造轮子，专注分析本身；\n杭州生活成本比北上广低不少，工作生活平衡较好；\n能接触真实业务数据，积累行业认知。\n\n但也真诚说下劝退项：\n前期很多时间在做数据清洗和报表需求，成就感偏低；\n数据分析岗晋升天花板相对明显，建议后期往算法或数据产品方向转。',
        createTime: now
      },
      {
        title: 'UI设计师',
        salary: '12K-22K',
        company: '视觉创意设计公司',
        location: '广州市天河区',
        date: '2024-03-10',
        tags: ['Figma', 'UI设计', '交互设计'],
        publisherId: insertedUsers['林小雨']._openid,
        publisher: { name: '林小雨', tag: '校友', openid: insertedUsers['林小雨']._openid },
        reviewer: { name: '陈国', tag: '老师' },
        likeCount: 18,
        applicationCount: 15,
        status: 'published',
        description: '负责产品UI/UX设计，制定设计规范，提升用户体验。',
        requirements: '熟练使用Figma/Sketch，具备良好的审美和交互设计能力，有作品集。',
        recommenderComment: '好处：\n设计团队小而精，每个人都能独立负责完整项目，锻炼综合能力；\n客户类型多样，作品集积累很快；\n广州生活节奏适中，加班不多。\n\n但也真诚说下劝退项：\n客户审美参差不齐，改稿频率较高，需要耐心；\n设计在公司的地位不如技术和产品，话语权有限。',
        createTime: now
      },
      {
        title: '算法工程师',
        salary: '25K-45K',
        company: 'AI未来科技有限公司',
        location: '北京市海淀区',
        date: '2024-03-08',
        tags: ['机器学习', '深度学习', 'NLP'],
        publisherId: insertedUsers['李明远']._openid,
        publisher: { name: '李明远', tag: '校友', openid: insertedUsers['李明远']._openid },
        reviewer: { name: '李教授', tag: '老师' },
        likeCount: 30,
        applicationCount: 16,
        status: 'published',
        description: '负责NLP相关算法研发，训练和优化大模型。',
        requirements: '硕士及以上学历，熟悉PyTorch/TensorFlow，有NLP项目经验，发表过论文优先。',
        recommenderComment: '好处：\n直接参与大模型训练和优化，这种机会在业界不多；\n算力资源充足，不用排队等GPU；\n团队学术背景强，鼓励发论文，对后续读博或跳槽大厂AI lab很有帮助。\n\n但也真诚说下劝退项：\n算法岗对学历和论文要求高，竞争激烈；\n模型训练周期长，有时一个实验跑几天结果不理想，挫败感会比较强。',
        createTime: now
      },
      {
        title: '运营专员',
        salary: '8K-15K',
        company: '启航教育集团',
        location: '武汉市洪山区',
        date: '2024-03-05',
        tags: ['内容运营', '社群运营', '活动策划'],
        publisherId: insertedUsers['王芳华']._openid,
        publisher: { name: '王芳华', tag: '校友', openid: insertedUsers['王芳华']._openid },
        reviewer: { name: '王教授', tag: '老师' },
        likeCount: 10,
        applicationCount: 8,
        status: 'published',
        description: '负责公司新媒体平台的内容运营和社群管理。',
        requirements: '文字功底好，熟悉新媒体运营，有教育行业经验优先。',
        recommenderComment: '好处：\n教育行业稳定性强，基本没有裁员风险；\n武汉生活成本低，这个薪资在当地过得很舒服；\n运营工作内容丰富，文案、活动、社群都能锻炼到。\n\n但也真诚说下劝退项：\n起薪相对互联网大厂偏低；\n教育行业节奏偏慢，想追求快速成长可能会觉得不够刺激。',
        createTime: now
      },
      {
        title: '测试开发工程师',
        salary: '15K-28K',
        company: '科技创新有限公司',
        location: '南京市雨花台区',
        date: '2024-03-03',
        tags: ['自动化测试', 'Selenium', '性能测试'],
        publisherId: insertedUsers['张文博']._openid,
        publisher: { name: '张文博', tag: '校友', openid: insertedUsers['张文博']._openid },
        reviewer: { name: '张教授', tag: '老师' },
        likeCount: 15,
        applicationCount: 10,
        status: 'published',
        description: '负责自动化测试框架搭建和维护，保障产品质量。',
        requirements: '熟悉自动化测试工具，掌握至少一门编程语言，有性能测试经验优先。',
        recommenderComment: '好处：\n测试开发是介于开发和测试之间的岗位，技术含量比手工测试高很多；\n能从质量保障视角理解整个系统架构，培养全局观；\n南京科技企业聚集，后续跳槽选择不少。\n\n但也真诚说下劝退项：\n测试岗在公司的话语权通常不如开发，推进质量改进需要耐心说服；\n发版前的集中测试期会比较忙。',
        createTime: now
      },
      {
        title: '运维工程师',
        salary: '18K-30K',
        company: '云计算服务有限公司',
        location: '成都市高新区',
        date: '2024-03-01',
        tags: ['Docker', 'Kubernetes', 'CI/CD'],
        publisherId: insertedUsers['陈志强']._openid,
        publisher: { name: '陈志强', tag: '校友', openid: insertedUsers['陈志强']._openid },
        reviewer: { name: '李教授', tag: '老师' },
        likeCount: 12,
        applicationCount: 6,
        status: 'published',
        description: '负责公司云原生基础设施的运维和优化。',
        requirements: '熟悉Docker/K8s，了解CI/CD流程，有Linux运维经验。',
        recommenderComment: '好处：\n云原生是当前技术趋势，K8s运维经验在市场上很吃香；\n成都互联网氛围不错，高新区附近生活便利；\n自动化程度高，日常大部分时间不是在灭火。\n\n但也真诚说下劝退项：\n运维的本质是"不出事没人记得你"，工作成果不易被量化；\n线上故障响应需要7x24小时轮值，半夜被电话叫起来是常态。',
        createTime: now
      },
      {
        title: '人力资源专员',
        salary: '10K-18K',
        company: '新思路咨询有限公司',
        location: '西安市雁塔区',
        date: '2024-02-28',
        tags: ['招聘', 'HRBP', '组织发展'],
        publisherId: insertedUsers['林小雨']._openid,
        publisher: { name: '林小雨', tag: '校友', openid: insertedUsers['林小雨']._openid },
        reviewer: { name: '陈国', tag: '老师' },
        likeCount: 8,
        applicationCount: 5,
        status: 'published',
        description: '负责公司招聘工作和员工关系管理。',
        requirements: '沟通能力强，了解劳动法规，有互联网公司HR经验优先。',
        recommenderComment: '好处：\n咨询公司接触的行业和岗位类型多，视野开阔；\n西安消费水平低，工作压力相对一线小很多；\nHRBP方向是未来趋势，发展路径清晰。\n\n但也真诚说下劝退项：\nHR在公司属于支持部门，晋升速度通常慢于业务线；\n招聘旺季工作量很大，简历筛选和面试安排非常琐碎。',
        createTime: now
      },
      // 待审核的职位（教师端可见）
      {
        title: '嵌入式开发工程师',
        salary: '15K-25K',
        company: '智能硬件有限公司',
        location: '深圳市宝安区',
        date: '2024-03-22',
        tags: ['C/C++', '嵌入式', '物联网'],
        publisherId: insertedUsers['张文博']._openid,
        publisher: { name: '张文博', tag: '校友', openid: insertedUsers['张文博']._openid },
        likeCount: 0,
        applicationCount: 0,
        status: 'pending',
        description: '负责嵌入式系统开发和调试。',
        requirements: '熟练C/C++，了解RTOS，有嵌入式开发经验。',
        recommenderComment: '好处：\n进来能把智能硬件这个品类从头到尾摸透，后续跳槽转其他智能硬件方向会很顺；\n项目类型多、机会多，能够迅速成长。\n\n但也真诚说下劝退项：\n工作强度很大；项目较多；压力较大。',
        createTime: now
      },
      {
        title: '扫地机器人嵌入式工程师',
        salary: '18K-30K',
        company: '智能硬件有限公司',
        location: '深圳市宝安区',
        date: '2024-03-25',
        tags: ['C/C++', '嵌入式', '扫地机器人', '智能硬件'],
        publisherId: insertedUsers['张文博']._openid,
        publisher: { name: '张文博', tag: '校友', openid: insertedUsers['张文博']._openid },
        reviewer: { name: '张教授', tag: '老师' },
        likeCount: 22,
        applicationCount: 14,
        status: 'published',
        description: '负责扫地机器人核心嵌入式系统开发，包括运动控制算法、传感器融合、SLAM导航等模块的开发与优化。',
        requirements: '本科及以上学历，电子信息/自动化/计算机相关专业；熟练C/C++，了解RTOS；有机器人或智能硬件项目经验优先。',
        recommenderComment: '好处：\n进来能把扫地机这个品类从头到尾摸透，后续跳槽转其他智能硬件方向会很顺；\n项目类型多、机会多，能够迅速成长；\n团队里有从大疆和石头科技过来的前辈，技术积累深厚。\n\n但也真诚说下劝退项：\n工作强度很大；项目较多；压力较大；硬件调试周期长，需要耐心。',
        createTime: now
      }
    ]

    const insertedJobs = {}
    for (const job of jobs) {
      const res = await db.collection('jobs').add({ data: job })
      insertedJobs[job.title] = res._id
      results.jobs++
    }

    // ============ 4. 插入申请数据 ============
    const applications = [
      {
        jobId: insertedJobs['前端开发工程师'],
        userId: insertedUsers['张三']._openid,
        publisherId: insertedUsers['姚经理']._openid,
        status: 'pending',
        applyDate: now,
        updateTime: now,
        jobSnapshot: { title: '前端开发工程师', company: '示例科技有限公司', salary: '15K-25K' },
        timeline: [{ status: 'pending', time: now, desc: '提交申请' }]
      },
      {
        jobId: insertedJobs['后端开发工程师'],
        userId: insertedUsers['李四']._openid,
        publisherId: insertedUsers['李明远']._openid,
        status: 'accepted',
        applyDate: now,
        updateTime: now,
        jobSnapshot: { title: '后端开发工程师', company: '云智科技有限公司', salary: '20K-35K' },
        timeline: [
          { status: 'pending', time: now, desc: '提交申请' },
          { status: 'accepted', time: now, desc: '审核通过' }
        ]
      },
      {
        jobId: insertedJobs['产品经理'],
        userId: insertedUsers['贾明']._openid,
        publisherId: insertedUsers['王芳华']._openid,
        status: 'rejected',
        applyDate: now,
        updateTime: now,
        jobSnapshot: { title: '产品经理', company: '创新互联网公司', salary: '18K-30K' },
        timeline: [
          { status: 'pending', time: now, desc: '提交申请' },
          { status: 'rejected', time: now, desc: '审核未通过' }
        ]
      },
      {
        jobId: insertedJobs['前端开发工程师'],
        userId: insertedUsers['赵雪']._openid,
        publisherId: insertedUsers['姚经理']._openid,
        status: 'accepted',
        applyDate: now,
        updateTime: now,
        jobSnapshot: { title: '前端开发工程师', company: '示例科技有限公司', salary: '15K-25K' },
        timeline: [
          { status: 'pending', time: now, desc: '提交申请' },
          { status: 'accepted', time: now, desc: '审核通过' }
        ]
      },
      {
        jobId: insertedJobs['数据分析师'],
        userId: insertedUsers['周琳']._openid,
        publisherId: insertedUsers['陈志强']._openid,
        status: 'pending',
        applyDate: now,
        updateTime: now,
        jobSnapshot: { title: '数据分析师', company: '数据智能科技有限公司', salary: '15K-25K' },
        timeline: [{ status: 'pending', time: now, desc: '提交申请' }]
      },
      {
        jobId: insertedJobs['UI设计师'],
        userId: insertedUsers['孙鹏']._openid,
        publisherId: insertedUsers['林小雨']._openid,
        status: 'pending',
        applyDate: now,
        updateTime: now,
        jobSnapshot: { title: 'UI设计师', company: '视觉创意设计公司', salary: '12K-22K' },
        timeline: [{ status: 'pending', time: now, desc: '提交申请' }]
      }
    ]

    for (const app of applications) {
      await db.collection('applications').add({ data: app })
      results.applications++
    }

    // ============ 5. 插入通知数据 ============
    const notifications = [
      { userId: insertedUsers['张三']._openid, type: 'application', title: '申请已提交', content: '您申请的「前端开发工程师」已提交，等待审核。', isRead: false, createTime: now, relatedId: insertedJobs['前端开发工程师'] },
      { userId: insertedUsers['李四']._openid, type: 'application', title: '申请已通过', content: '您申请的「后端开发工程师」已通过审核！', isRead: true, createTime: now, relatedId: insertedJobs['后端开发工程师'] },
      { userId: insertedUsers['贾明']._openid, type: 'application', title: '申请未通过', content: '您申请的「产品经理」未通过审核，请查看其他职位。', isRead: false, createTime: now, relatedId: insertedJobs['产品经理'] },
      { userId: insertedUsers['姚经理']._openid, type: 'application', title: '收到新的申请', content: '张三申请了您发布的「前端开发工程师」，请尽快处理。', isRead: false, createTime: now, relatedId: insertedJobs['前端开发工程师'] },
      { userId: insertedUsers['赵雪']._openid, type: 'application', title: '申请已通过', content: '您申请的「前端开发工程师」已通过审核！', isRead: false, createTime: now, relatedId: insertedJobs['前端开发工程师'] },
      { userId: insertedUsers['张教授']._openid, type: 'audit', title: '新职位待审核', content: '张文博发布了新职位「嵌入式开发工程师」，请审核。', isRead: false, createTime: now, relatedId: insertedJobs['嵌入式开发工程师'] }
    ]

    for (const noti of notifications) {
      await db.collection('notifications').add({ data: noti })
      results.notifications++
    }

    return {
      code: 200,
      message: '初始化成功',
      data: results
    }
  } catch (e) {
    return { code: 500, message: '初始化失败', error: e }
  }
}
