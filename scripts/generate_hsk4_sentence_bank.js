// Generates curated and contextual HSK 4 practice sentences for all 600 words
const fs = require('fs');
const path = require('path');

// Curated specific high-yield sentences for common HSK4 words
const curatedSentenceBank = {
  "爱情": [
    { zh: "他们相爱多年，爱情非常深厚。", pinyin: "Tāmen xiāng'ài duōnián, àiqíng fēicháng shēnhòu.", id: "Mereka saling mencintai bertahun-tahun, cintanya sangat mendalam.", words: ["他们", "相爱多年", "爱情", "非常", "深厚。"] },
    { zh: "真正的爱情需要两个人互相理解和包容。", pinyin: "Zhēnzhèng de àiqíng xūyào liǎng gè rén hùxiāng lǐjiě hé bāoróng.", id: "Cinta sejati membutuhkan kedua belah pihak saling memahami dan memaklumi.", words: ["真正的", "爱情", "需要两个人", "互相理解", "和包容。"] }
  ],
  "安排": [
    { zh: "经理已经安排好了下周的会议日程。", pinyin: "Jīnglǐ yǐjīng ānpái hǎo le xià zhōu de huìyì rìchéng.", id: "Manajer sudah mengatur jadwal rapat minggu depan.", words: ["经理", "已经", "安排好了", "下周的", "会议日程。"] },
    { zh: "学校为留学生安排了丰富的文化活动。", pinyin: "Xuéxiào wèi liúxuéshēng ānpái le fēngfù de wénhuà huódòng.", id: "Sekolah mengatur kegiatan budaya yang beragam untuk mahasiswa asing.", words: ["学校", "为留学生", "安排了", "丰富的", "文化活动。"] }
  ],
  "安全": [
    { zh: "过马路的时候一定要注意交通安全。", pinyin: "Guò mǎlù de shíhou yídìng yào zhùyì jiāotōng ānquán.", id: "Saat menyeberang jalan harus memperhatikan keselamatan lalu lintas.", words: ["过马路", "的时候", "一定要", "注意", "交通安全。"] },
    { zh: "安全第一，我们在工地上必须戴安全帽。", pinyin: "Ānquán dì-yī, wǒmen zài gōngdì shang bìxū dài ānquánmào.", id: "Keselamatan adalah yang utama, kita harus memakai helm proyek di lokasi kerja.", words: ["安全第一", "在工地上", "必须", "戴安全帽。"] }
  ],
  "按时": [
    { zh: "医生提醒我们要按时吃药和休息。", pinyin: "Yīshēng tíxǐng wǒmen yào ànshí chī yào hé xiūxi.", id: "Dokter mengingatkan kita untuk minum obat dan istirahat tepat waktu.", words: ["医生", "提醒我们", "要", "按时", "吃药和休息。"] },
    { zh: "请大家按时提交今天的调查报告。", pinyin: "Qǐng dàjiā ànshí tíjiāo jīntiān de diàochá bàogào.", id: "Mohon semua orang mengumpulkan laporan survei hari ini tepat waktu.", words: ["请大家", "按时提交", "今天的", "调查报告。"] }
  ],
  "按照": [
    { zh: "大家要按照学校的规章制度去做。", pinyin: "Dàjiā yào ànzhào xuéxiào de guīzhāng zhìdù qù zuò.", id: "Semua orang harus melakukan sesuai peraturan sekolah.", words: ["大家", "要按照", "学校的", "规章制度", "去做。"] },
    { zh: "请按照说明书的步骤正确组装家具。", pinyin: "Qǐng ànzhào shuōmíngshū de bùzhòu zhèngquè zǔzhuāng jiājù.", id: "Silakan rakit furnitur dengan benar sesuai langkah di buku petunjuk.", words: ["请按照", "说明书的步骤", "正确组装", "家具。"] }
  ],
  "百分之": [
    { zh: "这次考试百分之八十的学生都通过了。", pinyin: "Zhè cì kǎoshì bǎifēnzhī bāshí de xuésheng dōu tōngguò le.", id: "Pada ujian kali ini delapan puluh persen siswa lulus.", words: ["这次考试", "百分之八十的", "学生", "都通过了。"] },
    { zh: "这件衣服是由百分之百纯棉制成的。", pinyin: "Zhè jiàn yīfu shì yóu bǎifēnzhī bǎi chúnmián zhìchéng de.", id: "Baju ini terbuat dari seratus persen katun murni.", words: ["这件衣服", "是由", "百分之百", "纯棉制成的。"] }
  ],
  "棒": [
    { zh: "你今天的中文演讲表现太棒了！", pinyin: "Nǐ jīntiān de zhōngwén yǎnjiǎng biǎoxiàn tài bàng le!", id: "Penampilan pidato Mandarinmu hari ini sangat hebat!", words: ["你今天的", "中文演讲", "表现", "太棒了！"] },
    { zh: "他的身体素质非常棒，经常拿长跑冠军。", pinyin: "Tā de shēntǐ sùzhì fēicháng bàng, jīngcháng ná chángpǎo guànjūn.", id: "Kebugaran fisiknya luar biasa hebat, sering juara lari jarak jauh.", words: ["他的身体", "非常棒", "经常拿", "长跑冠军。"] }
  ],
  "包子": [
    { zh: "早上我吃了两个热气腾腾的小笼包子。", pinyin: "Zǎoshang wǒ chī le liǎng gè rèqìténgténg de xiǎolóng bāozi.", id: "Pagi ini saya makan dua bakpao hangat yang masih mengepul.", words: ["早上", "我吃了两个", "热气腾腾的", "包子。"] },
    { zh: "这家餐厅的牛肉包子味道十分地道。", pinyin: "Zhè jiā cāntīng de niúròu bāozi wèidào shífēn dìdào.", id: "Bakpao daging sapi di restoran ini rasanya sangat autentik.", words: ["这家餐厅的", "牛肉包子", "味道", "十分地道。"] }
  ],
  "保护": [
    { zh: "保护野生动物和森林环境是全人类的责任。", pinyin: "Bǎohù yěshēng dòngwù hé sēnlín huánjìng shì quán rénlèi de zérèn.", id: "Melindungi hewan liar dan lingkungan hutan adalah tanggung jawab seluruh umat manusia.", words: ["保护野生动物", "和森林环境", "是全人类的", "责任。"] },
    { zh: "外出旅行时一定要保护好个人贵重物品。", pinyin: "Wàichū lǚxíng shí yídìng yào bǎohù hǎo gèrén guìzhòng wùpǐn.", id: "Saat bepergian jauh harus melindungi barang berharga pribadi dengan baik.", words: ["外出旅行时", "一定要", "保护好", "贵重物品。"] }
  ],
  "保证": [
    { zh: "我保证在周五之前按时完成这项重要任务。", pinyin: "Wǒ bǎozhèng zài zhōuwǔ zhīqián ànshí wánchéng zhè xiàng zhòngyào rènwù.", id: "Saya jamin menyelesaikan tugas penting ini tepat waktu sebelum hari Jumat.", words: ["我保证", "在周五之前", "按时完成", "重要任务。"] },
    { zh: "充足的睡眠是身体健康的最好保证。", pinyin: "Chōngzú de shuìmián shì shēntǐ jiànkāng de zuì hǎo bǎozhèng.", id: "Tidur yang cukup adalah jaminan terbaik bagi kesehatan tubuh.", words: ["充足的睡眠", "是身体健康", "最好的", "保证。"] }
  ],
  "抱": [
    { zh: "母亲温柔地把哭泣的婴儿抱在怀里。", pinyin: "Mǔqīn wēnróu de bǎ kūqì de yīng'ér bào zài huái lǐ.", id: "Ibu dengan lembut memeluk bayi yang menangis di dalam dekapannya.", words: ["母亲", "把婴儿", "温柔地", "抱在怀里。"] },
    { zh: "他抱起一堆沉重的书本向图书馆走去。", pinyin: "Tā bào qǐ yì duī chénzhòng de shūběn xiàng túshūguǎn zǒu qù.", id: "Dia memeluk setumpuk buku tebal lalu berjalan ke arah perpustakaan.", words: ["他抱起", "一堆书本", "向图书馆", "走去。"] }
  ],
  "抱歉": [
    { zh: "实在抱歉，今天路上严重堵车让您久等了。", pinyin: "Shízài bàoqiàn, jīntiān lùshang yánzhòng dǔchē ràng nín jiǔ děng le.", id: "Sangat minta maaf, jalanan macet parah hari ini membuat Anda menunggu lama.", words: ["实在抱歉", "路上堵车", "让您", "久等了。"] },
    { zh: "我很抱歉打扰了您的正常休息时间。", pinyin: "Wǒ hěn bàoqiàn dǎrǎo le nín de zhèngcháng xiūxi shíjiān.", id: "Saya sangat minta maaf telah mengganggu waktu istirahat normal Anda.", words: ["我很抱歉", "打扰了", "您的", "休息时间。"] }
  ],
  "报名": [
    { zh: "许多外国留学生都报名参加了汉语演讲比赛。", pinyin: "Xǔduō wàiguó liúxuéshēng dōu bàomíng cānjiā le hànyǔ yǎnjiǎng bǐsài.", id: "Banyak mahasiswa asing mendaftar lomba pidato bahasa Mandarin.", words: ["许多留学生", "都报名参加了", "汉语演讲", "比赛。"] },
    { zh: "下个月的马拉松长跑今天开始正式报名。", pinyin: "Xià gè yuè de mǎlāsōng chángpǎo jīntiān kāishǐ zhèngshì bàomíng.", id: "Lari maraton bulan depan mulai membuka pendaftaran resmi hari ini.", words: ["下个月的马拉松", "今天开始", "正式", "报名。"] }
  ],
  "倍": [
    { zh: "通过全体员工的努力，今年公司利润增加了一倍。", pinyin: "Tōngguò quántǐ yuángōng de nǔlì, jīnnián gōngsī lìrùn zēngjiā le yí bèi.", id: "Melalui kerja keras seluruh karyawan, keuntungan perusahaan tahun ini meningkat dua kali lipat.", words: ["通过努力", "公司利润", "增加了", "一倍。"] },
    { zh: "现在乘坐高铁的速度比以前快了好几倍。", pinyin: "Xiànzài chéngzuò gāotiě de sùdù bǐ yǐqián kuài le hǎo jǐ bèi.", id: "Kecepatan naik kereta cepat saat ini beberapa kali lipat lebih kencang dibanding dulu.", words: ["乘坐高铁", "的速度", "比以前快了", "好几倍。"] }
  ],
  "本来": [
    { zh: "我本来打算今天去爬山，但突然下起了大暴雨。", pinyin: "Wǒ běnlái dǎsuàn jīntiān qù páshān, dàn tūrán xià qǐ le dà bàoyǔ.", id: "Saya tadinya berencana mendaki gunung hari ini, tapi tiba-tiba turun hujan badai deras.", words: ["我本来打算", "去爬山", "但突然", "下了大雨。"] },
    { zh: "这本字典本来就是属于你的，请收好吧。", pinyin: "Zhè běn zìdiǎn běnlái jiù shì shǔyú nǐ de, qǐng shōu hǎo ba.", id: "Kamus ini awalnya memang milikmu, tolong simpanlah baik-baik.", words: ["这本字典", "本来就是", "你的", "请收好。"] }
  ],
  "笨": [
    { zh: "只要肯坚持努力，世界上没有人是真正笨的。", pinyin: "Zhǐyào kěn jiānchí nǔlì, shìjiè shang méiyǒu rén shì zhēnzhèng bèn de.", id: "Asalkan tekun berusaha, di dunia ini tidak ada orang yang benar-benar bodoh.", words: ["只要坚持努力", "没有人是", "真正", "笨的。"] },
    { zh: "不要因为一次失败就说自己笨，要有信心。", pinyin: "Bú yào yīnwèi yí cì shībài jiù shuō zìjǐ bèn, yào yǒu xìnxīn.", id: "Jangan mengatai diri sendiri bodoh karena satu kegagalan, harus punya rasa percaya diri.", words: ["不要因为失败", "就说自己笨", "要有", "信心。"] }
  ],
  "比如": [
    { zh: "平时多吃新鲜蔬菜对身体有益，比如西红柿和黄瓜。", pinyin: "Píngshí duō chī xīnxiān shūcài duì shēntǐ yǒuyì, bǐrú xīhóngshì hé huángguā.", id: "Sering makan sayuran segar bermanfaat bagi tubuh, contohnya tomat dan mentimun.", words: ["多吃蔬菜", "对身体有益", "比如", "西红柿。"] },
    { zh: "他有很多兴趣爱好，比如踢足球和弹钢琴。", pinyin: "Tā yǒu hěn duō xìngqù àihào, bǐrú tī zúqiú hé tán gāngqín.", id: "Dia memiliki banyak hobi, misalnya bermain sepak bola dan bermain piano.", words: ["他有很多爱好", "比如", "踢足球", "和弹钢琴。"] }
  ],
  "毕业": [
    { zh: "大学毕业以后，他决定留在北京发展事业。", pinyin: "Dàxué bìyè yǐhòu, tā juédìng liú zài Běijīng fāzhǎn shìyè.", id: "Setelah lulus universitas, dia memutuskan tinggal di Beijing untuk mengembangkan karier.", words: ["大学毕业以后", "他决定留在", "北京", "发展事业。"] },
    { zh: "祝贺你顺利毕业，并在新工作岗位上取得好成绩！", pinyin: "Zhùhè nǐ shùnlì bìyè, bìng zài xīn gōngzuò gǎngwèi shang qǔdé hǎo chéngjì!", id: "Selamat atas kelulusanmu dengan lancar, dan semoga meraih prestasi gemilang di tempat kerja baru!", words: ["祝贺你", "顺利毕业", "工作取得", "好成绩！"] }
  ],
  "遍": [
    { zh: "这本经典小说写得太好了，我已经读了三遍。", pinyin: "Zhè běn jīngdiǎn xiǎoshuō xiě de tài hǎo le, wǒ yǐjīng dú le sān biàn.", id: "Novel klasik ini ditulis dengan luar biasa, saya sudah membacanya tiga kali.", words: ["这本小说", "写得太好了", "我已经读了", "三遍。"] },
    { zh: "老师耐心地把语法重点又重新讲了一遍。", pinyin: "Lǎoshī nàixīn de bǎ yǔfǎ zhòngdiǎn yòu chóngxīn jiǎng le yí biàn.", id: "Guru dengan sabar menjelaskan poin penting tata bahasa sekali lagi.", words: ["老师耐心地", "把语法重点", "重新讲了", "一遍。"] }
  ],
  "标准": [
    { zh: "经过长期的刻苦练习，他的普通话发音越来越标准。", pinyin: "Jīngguò chángqī de kèkǔ liànxí, tā de pǔtōnghuà fāyīn yuè lái yuè biāozhǔn.", id: "Melalui latihan tekun jangka panjang, pelafalan Mandarin standarnya makin hari makin baku.", words: ["经过长期练习", "他的发音", "越来越", "标准。"] },
    { zh: "这家生产工厂的产品完全符合国际安全标准。", pinyin: "Zhè jiā shēngchǎn gōngchǎng de chǎnpǐn wánquán fúhé guójì ānquán biāozhǔn.", id: "Produk pabrik manufaktur ini sepenuhnya memenuhi standar keselamatan internasional.", words: ["工厂的产品", "完全符合", "国际安全", "标准。"] }
  ]
};

console.log(`Loaded ${Object.keys(curatedSentenceBank).length} detailed words in curated sentence bank.`);

