// Generator of full 600 HSK 4 words with authentic sentences & Indonesian translations
const fs = require('fs');
const path = require('path');

// Load words summary and translations
const wordsSummary = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'words_summary.json'), 'utf8'));

// Import translations
const genCompleteData = fs.readFileSync(path.join(__dirname, 'generate_complete_data.js'), 'utf8');
const idMatch = genCompleteData.match(/const idTranslations = (\{[\s\S]*?\n\};)/);
let idTranslations = {};
if (idMatch) {
  eval('idTranslations = ' + idMatch[1]);
}

console.log(`Loaded ${Object.keys(idTranslations).length} translations.`);

// Custom curated sentences for high-frequency words
const customSentences = {
  "爱情": [
    { zh: "他们相爱多年，爱情非常深厚。", pinyin: "Tāmen xiāng'ài duōnián, àiqíng fēicháng shēnhòu.", id: "Mereka saling mencintai bertahun-tahun, cintanya sangat mendalam.", words: ["他们", "相爱多年", "爱情", "非常", "深厚。"] },
    { zh: "真正的爱情需要两个人互相理解。", pinyin: "Zhēnzhèng de àiqíng xūyào liǎng gè rén hùxiāng lǐjiě.", id: "Cinta sejati membutuhkan kedua pihak saling memahami.", words: ["真正的", "爱情", "需要两个人", "互相理解。"] }
  ],
  "安排": [
    { zh: "经理已经安排好了下周的会议日程。", pinyin: "Jīnglǐ yǐjīng ānpái hǎo le xià zhōu de huìyì rìchéng.", id: "Manajer sudah mengatur jadwal rapat minggu depan.", words: ["经理", "已经", "安排好了", "下周的", "会议日程。"] },
    { zh: "学校为留学生安排了丰富的文化活动。", pinyin: "Xuéxiào wèi liúxuéshēng ānpái le fēngfù de wénhuà huódòng.", id: "Sekolah mengatur kegiatan budaya yang beragam untuk mahasiswa asing.", words: ["学校", "为留学生", "安排了", "文化活动。"] }
  ],
  "安全": [
    { zh: "过马路的时候一定要注意交通安全。", pinyin: "Guò mǎlù de shíhou yídìng yào zhùyì jiāotōng ānquán.", id: "Saat menyeberang jalan harus memperhatikan keselamatan lalu lintas.", words: ["过马路", "的时候", "一定要", "注意", "交通安全。"] },
    { zh: "施工现场必须戴安全帽以确保安全。", pinyin: "Shīgōng xiànchǎng bìxū dài ānquánmào yǐ quèbǎo ānquán.", id: "Lokasi proyek harus memakai helm pengaman untuk memastikan keselamatan.", words: ["施工现场", "必须戴安全帽", "以确保", "安全。"] }
  ],
  "按时": [
    { zh: "医生提醒我们要按时吃药和休息。", pinyin: "Yīshēng tíxǐng wǒmen yào ànshí chī yào hé xiūxi.", id: "Dokter mengingatkan kita untuk minum obat dan istirahat tepat waktu.", words: ["医生", "提醒我们", "要", "按时", "吃药和休息。"] },
    { zh: "请大家按时提交今天的汉语作业。", pinyin: "Qǐng dàjiā ànshí tíjiāo jīntiān de hànyǔ zuòyè.", id: "Mohon semuanya mengumpulkan tugas bahasa Mandarin hari ini tepat waktu.", words: ["请大家", "按时提交", "今天的", "汉语作业。"] }
  ],
  "按照": [
    { zh: "大家要按照学校的规章制度去做。", pinyin: "Dàjiā yào ànzhào xuéxiào de guīzhāng zhìdù qù zuò.", id: "Semua orang harus melakukan sesuai peraturan sekolah.", words: ["大家", "要按照", "学校的", "规章制度", "去做。"] },
    { zh: "请按照说明书的步骤正确组装家具。", pinyin: "Qǐng ànzhào shuōmíngshū de bùzhòu zhèngquè zǔzhuāng jiājù.", id: "Silakan rakit furnitur dengan benar sesuai petunjuk buku panduan.", words: ["请按照", "说明书的步骤", "正确组装", "家具。"] }
  ],
  "百分之": [
    { zh: "这次考试百分之八十的学生都及格了。", pinyin: "Zhè cì kǎoshì bǎifēnzhī bāshí de xuésheng dōu jígé le.", id: "Pada ujian kali ini delapan puluh persen siswa lulus.", words: ["这次考试", "百分之八十的", "学生", "都及格了。"] },
    { zh: "今天百货大楼的衣服有百分之三十的折扣。", pinyin: "Jīntiān bǎihuò dàlóu de yīfu yǒu bǎifēnzhī sānshí de zhékòu.", id: "Baju di mall hari ini ada diskon tiga puluh persen.", words: ["百货大楼的衣服", "有", "百分之三十的", "折扣。"] }
  ],
  "棒": [
    { zh: "你今天的中文演讲表现太棒了！", pinyin: "Nǐ jīntiān de zhōngwén yǎnjiǎng biǎoxiàn tài bàng le!", id: "Penampilan pidato Mandarinmu hari ini sangat hebat!", words: ["你今天的", "中文演讲", "表现", "太棒了！"] },
    { zh: "他的书法写得真棒，大家都赞不绝口。", pinyin: "Tā de shūfǎ xiě de zhēn bàng, dàjiā dōu zàn bù jué kǒu.", id: "Kaligrafi yang ditulisnya sangat hebat, semua orang tak henti memuji.", words: ["他的书法", "写得真棒", "大家", "赞不绝口。"] }
  ],
  "包子": [
    { zh: "早上我吃了两个热气腾腾的肉包子。", pinyin: "Zǎoshang wǒ chī le liǎng gè rèqìténgténg de ròubāozi.", id: "Pagi ini saya makan dua bakpao daging yang masih hangat.", words: ["早上", "我吃了", "两个", "热肉包子。"] },
    { zh: "这家餐馆的小笼包子非常多汁美味。", pinyin: "Zhè jiā cānguǎn de xiǎolóng bāozi fēicháng duōzhī měiwèi.", id: "Bakpao kukus di restoran ini sangat lezat dan berkuah juicy.", words: ["这家餐馆的", "小笼包子", "非常", "多汁美味。"] }
  ],
  "保护": [
    { zh: "保护大自然环境是全人类共同的责任。", pinyin: "Bǎohù dàzìrán huánjìng shì quán rénlèi gòngtóng de zérèn.", id: "Melindungi lingkungan alam adalah tanggung jawab bersama seluruh umat manusia.", words: ["保护大自然环境", "是全人类", "共同的", "责任。"] },
    { zh: "在强烈的阳光下我们要保护好皮肤。", pinyin: "Zài qiángliè de yángguāng xià wǒmen yào bǎohù hǎo pífū.", id: "Di bawah terik sinar matahari kita harus melindungi kulit dengan baik.", words: ["在强烈阳光下", "我们要", "保护好", "皮肤。"] }
  ],
  "保证": [
    { zh: "我保证在明天下午之前完成这项工作。", pinyin: "Wǒ bǎozhèng zài míngtiān xiàwǔ zhīqián wánchéng zhè xiàng gōngzuò.", id: "Saya jamin menyelesaikan pekerjaan ini sebelum besok sore.", words: ["我保证", "在明天下午之前", "完成", "这项工作。"] },
    { zh: "充足的睡眠是保证工作效率的前提。", pinyin: "Chōngzú de shuìmián shì bǎozhèng gōngzuò xiàolǜ de qiántí.", id: "Tidur yang cukup adalah prasyarat untuk menjamin efisiensi kerja.", words: ["充足的睡眠", "是保证", "工作效率的", "前提。"] }
  ],
  "抱": [
    { zh: "母亲温柔地把哭泣的婴儿抱在怀里。", pinyin: "Mǔqīn wēnróu de bǎ kūqì de yīng'ér bào zài huái lǐ.", id: "Ibu dengan lembut memeluk bayi yang menangis di dekapannya.", words: ["母亲", "把婴儿", "温柔地", "抱在怀里。"] },
    { zh: "老朋友见面时热情地抱在一起。", pinyin: "Lǎo péngyou jiànmiàn shí rèqíng de bào zài yìqǐ.", id: "Saat teman lama bertemu mereka saling berpelukan dengan hangat.", words: ["老朋友见面时", "热情地", "抱在一起。"] }
  ],
  "抱歉": [
    { zh: "实在抱歉，今天路上堵车我来晚了。", pinyin: "Shízài bàoqiàn, jīntiān lùshang dǔchē wǒ lái wǎn le.", id: "Sangat minta maaf, hari ini jalanan macet jadi saya terlambat.", words: ["实在抱歉", "路上堵车", "我", "来晚了。"] },
    { zh: "非常抱歉给您的工作带来了很多麻烦。", pinyin: "Fēicháng bàoqiàn gěi nín de gōngzuò dài lái le hěn duō máfan.", id: "Sangat minta maaf telah menimbulkan banyak kesulitan bagi pekerjaan Anda.", words: ["非常抱歉", "给您的工作", "带来了", "很多麻烦。"] }
  ],
  "报名": [
    { zh: "很多外国留学生都报名参加了汉语比赛。", pinyin: "Hěn duō wàiguó liúxuéshēng dōu bàomíng cānjiā le hànyǔ bǐsài.", id: "Banyak mahasiswa asing mendaftar lomba bahasa Mandarin.", words: ["很多留学生", "都报名参加了", "汉语比赛。"] },
    { zh: "我想报名参加这所大学的暑期研修班。", pinyin: "Wǒ xiǎng bàomíng cānjiā zhè suǒ dàxué de shǔqī yánxiūbān.", id: "Saya ingin mendaftar kelas kursus musim panas di universitas ini.", words: ["我想报名", "参加大学的", "暑期研修班。"] }
  ],
  "倍": [
    { zh: "今年我们公司的营业额增加了一倍。", pinyin: "Jīnnián wǒmen gōngsī de yíngyè'é zēngjiā le yí bèi.", id: "Tahun ini omzet perusahaan kami meningkat dua kali lipat.", words: ["今年", "我们公司的营业额", "增加了", "一倍。"] },
    { zh: "现在乘坐高铁比普通列车快了三倍。", pinyin: "Xiànzài chéngzuò gāotiě bǐ pǔtōng lièchē kuài le sān bèi.", id: "Sekarang naik kereta cepat tiga kali lebih kencang dari kereta biasa.", words: ["乘坐高铁", "比普通列车", "快了", "三倍。"] }
  ],
  "本来": [
    { zh: "我本来打算今天去，但突然下暴雨了。", pinyin: "Wǒ běnlái dǎsuàn jīntiān qù, dàn tūrán xià bàoyǔ le.", id: "Saya tadinya berencana pergi hari ini, tapi mendadak hujan deras.", words: ["我本来打算去", "但突然", "下了", "暴雨。"] },
    { zh: "这件事情本来就很简单，别想得太复杂。", pinyin: "Zhè jiàn shìqing běnlái jiù hěn jiǎndān, bié xiǎng de tài fùzá.", id: "Hal ini pada dasarnya sangat sederhana, jangan dipikir terlalu rumit.", words: ["这件事情", "本来就很简单", "别想得", "太复杂。"] }
  ],
  "笨": [
    { zh: "只要肯努力，世界上没有人是真正笨的。", pinyin: "Zhǐyào kěn nǔlì, shìjiè shang méiyǒu rén shì zhēnzhèng bèn de.", id: "Asalkan mau berusaha, di dunia ini tidak ada orang yang benar-benar bodoh.", words: ["只要肯努力", "没有人是", "真正", "笨的。"] },
    { zh: "不要因为一次小错误就觉得自己笨。", pinyin: "Bú yào yīnwèi yí cì xiǎo cuòwù jiù juéde zìjǐ bèn.", id: "Jangan merasa dirimu bodoh hanya karena sebuah kesalahan kecil.", words: ["不要因为小错误", "就觉得", "自己", "笨。"] }
  ],
  "比如": [
    { zh: "多吃新鲜水果对健康好，比如苹果和香蕉。", pinyin: "Duō chī xīnxiān shuǐguǒ duì jiànkāng hǎo, bǐrú píngguǒ hé xiāngjiāo.", id: "Banyak makan buah segar bagus untuk kesehatan, misalnya apel dan pisang.", words: ["多吃水果", "对健康好", "比如", "苹果和香蕉。"] },
    { zh: "他掌握多种语言，比如汉语、英语和法语。", pinyin: "Tā zhǎngwò duō zhǒng yǔyán, bǐrú hànyǔ, yīngyǔ hé fǎyǔ.", id: "Dia menguasai banyak bahasa, contohnya Mandarin, Inggris, dan Prancis.", words: ["他掌握多种语言", "比如汉语", "英语", "和法语。"] }
  ],
  "毕业": [
    { zh: "大学毕业以后，他决定去上海开创事业。", pinyin: "Dàxué bìyè yǐhòu, tā juédìng qù Shànghǎi kāichuàng shìyè.", id: "Setelah lulus universitas, dia memutuskan pergi ke Shanghai merintis karier.", words: ["大学毕业以后", "他去上海", "开创", "事业。"] },
    { zh: "全班同学在毕业典礼上高兴地合影留念。", pinyin: "Quán bān tóngxué zài bìyè diǎnlǐ shang gāoxìng de héyǐng liúniàn.", id: "Seluruh teman sekelas berfoto bersama dengan gembira di upacara wisuda kelulusan.", words: ["全班同学", "在毕业典礼上", "合影", "留念。"] }
  ],
  "遍": [
    { zh: "这篇文章写得很好，我已经认真读了三遍。", pinyin: "Zhè piān wénzhāng xiě de hěn hǎo, wǒ yǐjīng rènzhēn dú le sān biàn.", id: "Artikel ini ditulis dengan baik, saya sudah membacanya dengan sungguh-sungguh tiga kali.", words: ["这篇文章", "我已经认真", "读了", "三遍。"] },
    { zh: "请老师再慢速把这段话读一遍好吗？", pinyin: "Qǐng lǎoshī zài mànsù bǎ zhè duàn huà dú yí biàn hǎo ma?", id: "Bolehkah guru membacakan paragraf ini sekali lagi dengan pelan?", words: ["请老师", "慢速把这段话", "再读", "一遍。"] }
  ],
  "标准": [
    { zh: "他的普通话发音非常纯正而标准。", pinyin: "Tā de pǔtōnghuà fāyīn fēicháng chúnzhèng ér biāozhǔn.", id: "Pelafalan bahasa Mandarin standarnya sangat murni dan baku.", words: ["他的", "普通话发音", "非常", "标准。"] },
    { zh: "我们公司在选拔人才时有一套严格的标准。", pinyin: "Wǒmen gōngsī zài xuǎnbá réncái shí yǒu yí tào yángé de biāozhǔn.", id: "Perusahaan kami memiliki seperangkat kriteria standar ketat saat merekrut talenta.", words: ["公司选拔人才", "有一套严格的", "标准。"] }
  ],
  "表格": [
    { zh: "请您把这张个人信息登记表格填写完整。", pinyin: "Qǐng nín bǎ zhè zhāng gèrén xìnxī dēngjì biǎogé tiánxiě wánzhěng.", id: "Silakan Anda mengisi formulir pendaftaran informasi pribadi ini secara lengkap.", words: ["请您把", "个人信息", "表格", "填写完整。"] },
    { zh: "请根据调查数据绘制一份详细的统计表格。", pinyin: "Qǐng gēnjù diàochá shùjù huìzhì yí fèn xiángxì de tǒngjì biǎogé.", id: "Silakan buat tabel statistik terperinci berdasarkan data hasil survei.", words: ["请根据调查数据", "绘制一份", "统计表格。"] }
  ],
  "表示": [
    { zh: "他微笑着点头表示赞同我的提议。", pinyin: "Tā wēixiào zhe diǎntóu biǎoshì zàntóng wǒ de tíyì.", id: "Dia tersenyum sambil mengangguk tanda menyetujui usulan saya.", words: ["他微笑点头", "表示赞同", "我的", "提议。"] },
    { zh: "在汉语文化中红色表示吉祥与喜庆。", pinyin: "Zài hànyǔ wénhuà zhōng hóngsè biǎoshì jíxiáng yǔ xǐqìng.", id: "Dalam budaya Tionghoa warna merah melambangkan keberuntungan dan kegembiraan.", words: ["在文化中", "红色表示", "吉祥与", "喜庆。"] }
  ],
  "表演": [
    { zh: "今晚杂技团的精彩表演赢得了全场掌声。", pinyin: "Jīnwǎn zájìtuán de jīngcǎi biǎoyǎn yíngdé le quánchǎng zhǎngshēng.", id: "Pertunjukan memukau dari kelompok akrobat malam ini meraih tepuk tangan seluruh penonton.", words: ["精彩的表演", "赢得了", "全场", "掌声。"] },
    { zh: "孩子们在舞台上自信地表演中国武术。", pinyin: "Háizimen zài wǔtái shang zìxìn de biǎoyǎn zhōngguó wǔshù.", id: "Anak-anak tampil dengan percaya diri mementaskan seni bela diri Tiongkok di atas panggung.", words: ["孩子们在舞台上", "自信地", "表演", "中国武术。"] }
  ],
  "表扬": [
    { zh: "校长在大会上公开表扬了助人为乐的同学。", pinyin: "Xiàozhǎng zài dàhuì shang gōngkāi biǎoyáng le zhùrén wéi lè de tóngxué.", id: "Kepala sekolah memuji secara terbuka siswa yang suka menolong di pertemuan akbar.", words: ["校长公开", "表扬了", "助人为乐的", "同学。"] },
    { zh: "得到老师的表扬后他学习更加积极主动了。", pinyin: "Dédào lǎoshī de biǎoyáng hòu tā xuéxí gèngjiā jījí zhǔdòng le.", id: "Setelah mendapat pujian guru dia belajar menjadi jauh lebih proaktif dan bersemangat.", words: ["得到表扬后", "他学习更加", "积极主动了。"] }
  ],
  "饼干": [
    { zh: "妹妹最喜欢吃草莓夹心甜饼干。", pinyin: "Mèimei zuì xǐhuan chī cǎoméi jiāxīn tián bǐnggān.", id: "Adik perempuan paling suka makan biskuit manis isi selai stroberi.", words: ["妹妹最喜欢吃", "草莓夹心", "饼干。"] },
    { zh: "下午喝热茶的时候配上几块饼干非常舒服。", pinyin: "Xiàwǔ hē rè chá de shíhou pèi shang jǐ kuài bǐnggān fēicháng shūfu.", id: "Saat minum teh hangat di sore hari ditemani beberapa keping biskuit terasa sangat nyaman.", words: ["喝热茶的时候", "配上几块", "饼干", "很舒服。"] }
  ],
  "并且": [
    { zh: "他不仅思维敏捷，并且工作效率非常高。", pinyin: "Tā bùjǐn sīwéi mǐnjié, bìngqiě gōngzuò xiàolǜ fēicháng gāo.", id: "Dia bukan hanya berpikir tangkas, lagipula efisiensi kerjanya sangat tinggi.", words: ["他不仅聪明", "并且", "工作效率", "非常高。"] },
    { zh: "我们已经完成了全部调研，并且写好了总结报告。", pinyin: "Wǒmen yǐjīng wánchéng le quánbù diàoyán, bìngqiě xiě hǎo le zǒngjié bàogào.", id: "Kami telah menyelesaikan seluruh riset, dan juga sudah menulis laporan ringkasan.", words: ["完成调研", "并且写好了", "总结报告。"] }
  ],
  "博士": [
    { zh: "他在北京大学获得了计算机专业博士学位。", pinyin: "Tā zài Běijīng Dàxué huòdé le jìsuànjī zhuānyè bóshì xuéwèi.", id: "Dia meraih gelar doktor ilmu komputer di Universitas Peking.", words: ["他在大学", "获得了", "计算机专业", "博士学位。"] },
    { zh: "这位年轻的博士发表了很多重要的学术论文。", pinyin: "Zhè wèi niánqīng de bóshì fābiǎo le hěn duō zhòngyào de xuéshù lùnwén.", id: "Doktor muda ini telah mempublikasikan banyak makalah ilmiah penting.", words: ["年轻的博士", "发表了许多", "重要论文。"] }
  ],
  "不过": [
    { zh: "这件羊毛大衣版型很好看，不过价格稍微有点贵。", pinyin: "Zhè jiàn yángmáo dàyī bǎnxíng hěn hǎokàn, búguò jiàgé shāowēi yǒudiǎn guì.", id: "Mantel wol ini potongannya sangat bagus, namun harganya agak sedikit mahal.", words: ["大衣很好看", "不过", "价格", "有点贵。"] },
    { zh: "虽然任务艰巨，不过我相信我们一定能克服困难。", pinyin: "Suīrán rènwù jiānjù, búguò wǒ xiāngxìn wǒmen yídìng néng kèfú kùnnan.", id: "Meskipun tugasnya berat, namun saya yakin kita pasti sanggup mengatasi kesulitan.", words: ["任务艰巨", "不过我相信", "我们能克服困难。"] }
  ],
  "不得不": [
    { zh: "因为外面暴风雨太大，航班不得不推迟起飞。", pinyin: "Yīnwèi wàimiàn bàofēngyǔ tài dà, hángbān bùdébù tuīchí qǐfēi.", id: "Karena badai hujan di luar terlalu deras, penerbangan terpaksa menunda lepas landas.", words: ["因为暴风雨太大", "航班", "不得不", "推迟起飞。"] },
    { zh: "为了按时交付任务，我们今晚不得不加班工作。", pinyin: "Wèile ànshí jiāofù rènwù, wǒmen jīnwǎn bùdébù jiābān gōngzuò.", id: "Demi mengumpulkan tugas tepat waktu, malam ini kami terpaksa bekerja lembur.", words: ["为了按时交付", "我们今晚", "不得不", "加班工作。"] }
  ],
  "不管": [
    { zh: "不管遇到多大困难，我们都要坚持走下去。", pinyin: "Bùguǎn yùdào duō dà kùnnan, wǒmen dōu yào jiānchí zǒu xiàqù.", id: "Tidak peduli sebesar apa kesulitan yang dihadapi, kita harus terus melangkah pantang mundur.", words: ["不管遇到困难", "我们都要", "坚持走下去。"] },
    { zh: "不管刮风下雨，他每天早晨都去公园晨跑。", pinyin: "Bùguǎn guāfēng xiàyǔ, tā měitiān zǎochén dōu qù gōngyuán chénpǎo.", id: "Tidak peduli angin kencang atau hujan, setiap pagi dia tetap pergi joging ke taman.", words: ["不管刮风下雨", "他每天早晨", "都去晨跑。"] }
  ]
};

console.log(`Configured high-yield sentences.`);

