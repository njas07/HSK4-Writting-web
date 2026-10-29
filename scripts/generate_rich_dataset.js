// Comprehensive HSK 4 Rich Dataset Generator
// Populates all 600 words with authentic sentences, pinyin, Indonesian translations, and 2 practice sentences each.
const fs = require('fs');
const path = require('path');
const extraCurated = require('./curated_sentences_bank');

const wordsSummary = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'words_summary.json'), 'utf8'));

// Load Indonesian translations from generate_complete_data.js
const genCompleteData = fs.readFileSync(path.join(__dirname, 'generate_complete_data.js'), 'utf8');
const idMatch = genCompleteData.match(/const idTranslations = (\{[\s\S]*?\n\};)/);
let idTranslations = {};
if (idMatch) {
  eval('idTranslations = ' + idMatch[1]);
}

// Curated authentic sentences dictionary
const curatedSentences = {
  ...extraCurated,
  "爱情": [
    { zh: "他们相爱多年，爱情非常深厚。", pinyin: "Tāmen xiāng'ài duōnián, àiqíng fēicháng shēnhòu.", id: "Mereka saling mencintai bertahun-tahun, cintanya sangat mendalam.", words: ["他们", "相爱多年", "爱情", "非常", "深厚。"] },
    { zh: "真正的爱情需要两个人互相理解和包容。", pinyin: "Zhēnzhèng de àiqíng xūyào liǎng gè rén hùxiāng lǐjiě hé bāoróng.", id: "Cinta sejati membutuhkan kedua belah pihak saling memahami dan memaklumi.", words: ["真正的", "爱情", "需要两个人", "互相理解", "和包容。"] }
  ],
  "安排": [
    { zh: "经理已经安排好了下周的会议日程。", pinyin: "Jīnglǐ yǐjīng ānpái hǎo le xià zhōu de huìyì rìchéng.", id: "Manajer sudah mengatur jadwal rapat minggu depan.", words: ["经理", "已经", "安排好了", "下周的", "会议日程。"] },
    { zh: "学校为外国留学生安排了丰富的文化活动。", pinyin: "Xuéxiào wèi wàiguó liúxuéshēng ānpái le fēngfù de wénhuà huódòng.", id: "Sekolah mengatur kegiatan budaya yang beragam untuk mahasiswa asing.", words: ["学校", "为留学生", "安排了", "丰富的", "文化活动。"] }
  ],
  "安全": [
    { zh: "过马路的时候一定要注意交通安全。", pinyin: "Guò mǎlù de shíhou yídìng yào zhùyì jiāotōng ānquán.", id: "Saat menyeberang jalan harus memperhatikan keselamatan lalu lintas.", words: ["过马路", "的时候", "一定要", "注意", "交通安全。"] },
    { zh: "在工地上施工必须戴安全帽以保证安全。", pinyin: "Zài gōngdì shang shīgōng bìxū dài ānquánmào yǐ bǎozhèng ānquán.", id: "Bekerja di proyek harus memakai helm demi menjamin keselamatan.", words: ["在工地上施工", "必须戴安全帽", "保证", "安全。"] }
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
    { zh: "他的身体素质非常棒，经常拿长跑冠军。", pinyin: "Tā de shēntǐ sùzhì fēicháng bàng, jīngcháng ná chángpǎo guànjūn.", id: "Kebugaran fisiknya luar biasa hebat, sering juara lari jarak jauh.", words: ["他的身体", "非常棒", "经常拿", "长跑冠军。"] }
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
    { zh: "我保证在周五之前按时完成这项重要任务。", pinyin: "Wǒ bǎozhèng zài zhōuwǔ zhīqián ànshí wánchéng zhè xiàng zhòngyào rènwù.", id: "Saya jamin menyelesaikan tugas penting ini tepat waktu sebelum hari Jumat.", words: ["我保证", "在周五之前", "按时完成", "重要任务。"] },
    { zh: "充足的睡眠是保证身心健康的最好良药。", pinyin: "Chōngzú de shuìmián shì bǎozhèng shēnxīn jiànkāng de zuì hǎo liángyào.", id: "Tidur yang cukup adalah obat terbaik untuk menjamin kesehatan lahir dan batin.", words: ["充足的睡眠", "是保证身心健康", "最好的", "良药。"] }
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
  ]
};

// Additional curated patterns for common word types
const verbPatterns = [
  (h, p, id) => ({
    zh: `我们计划明天开始${h}，请大家做好准备。`,
    pinyin: `Wǒmen jìhuà míngtiān kāishǐ ${p}, qǐng dàjiā zuò hǎo zhǔnbèi.`,
    id: `Kita berencana mulai ${id} besok, mohon semuanya bersiap-siap.`,
    words: ["我们计划", "明天开始", h, "做好准备。"]
  }),
  (h, p, id) => ({
    zh: `在老师的指导下，大家正在认真${h}。`,
    pinyin: `Zài lǎoshī de zhǐdǎo xià, dàjiā zhèngzài rènzhēn ${p}.`,
    id: `Di bawah bimbingan guru, semua orang sedang ${id} dengan sungguh-sungguh.`,
    words: ["在老师指导下", "大家正在", "认真", `${h}。`]
  })
];

const nounPatterns = [
  (h, p, id) => ({
    zh: `这个${h}对我们接下来的工作有很大帮助。`,
    pinyin: `Zhè ge ${p} duì wǒmen jiēxiàlái de gōngzuò yǒu hěn dà bāngzhù.`,
    id: `${id.charAt(0).toUpperCase() + id.slice(1)} ini sangat membantu kelanjutan pekerjaan kita.`,
    words: ["这个", h, "对我们的工作", "有很大帮助。"]
  }),
  (h, p, id) => ({
    zh: `请大家保管好相关的${h}，不要弄丢了。`,
    pinyin: `Qǐng dàjiā bǎoguǎn hǎo xiāngguān de ${p}, bú yào nòng diū le.`,
    id: `Mohon semuanya menjaga ${id} terkait dengan baik, jangan sampai hilang.`,
    words: ["请大家保管好", "相关的", h, "不要弄丢。"]
  })
];

const adjPatterns = [
  (h, p, id) => ({
    zh: `经过大家的共同努力，事情进展得非常${h}。`,
    pinyin: `Jīngguò dàjiā de gòngtóng nǔlì, shìqing jìnzhǎn de fēicháng ${p}.`,
    id: `Melalui upaya bersama semua orang, hal ini berkembang dengan sangat ${id}.`,
    words: ["经过大家的努力", "事情进展得", "非常", `${h}。`]
  }),
  (h, p, id) => ({
    zh: `做事情要保持${h}的态度，这样才能做好。`,
    pinyin: `Zuò shìqing yào bǎochí ${p} de tàidù, zhèyàng cái néng zuò hǎo.`,
    id: `Dalam mengerjakan sesuatu harus mempertahankan sikap yang ${id}, dengan begitu baru bisa selesai baik.`,
    words: ["做事情", "要保持", `${h}的态度`, "才能做好。"]
  })
];

const generalPatterns = [
  (h, p, id) => ({
    zh: `在日常汉语表达中，经常会用到“${h}”这个词。`,
    pinyin: `Zài rìcháng hànyǔ biǎodá zhōng, jīngcháng huì yòng dào "${p}" zhè ge cí.`,
    id: `Dalam ungkapan bahasa Mandarin sehari-hari, kata "${id}" sering digunakan.`,
    words: ["在日常表达中", "经常用到", `“${h}”`, "这个词。"]
  }),
  (h, p, id) => ({
    zh: `熟练运用“${h}”造句，能让你的汉语表达更地道。`,
    pinyin: `Shúliàn yùnyòng "${p}" zàojù, néng ràng nǐ de hànyǔ biǎodá gèng dìdào.`,
    id: `Terampil menggunakan "${id}" dalam kalimat dapat membuat ungkapan Mandarinmu lebih alami.`,
    words: ["熟练运用", `“${h}”造句`, "让表达", "更地道。"]
  })
];

// Helper to determine best category for each word
function getSentencesForWord(w, idMeaning) {
  const h = w.h;
  const p = w.p;
  const id = idMeaning || w.en;

  if (curatedSentences[h]) {
    return curatedSentences[h];
  }

  // Check characteristics
  let pool = generalPatterns;
  const verbClues = ["berangkat", "mengatur", "melindungi", "mendaftar", "menolak", "menerima", "membuat", "membaca", "menulis", "belajar", "naik", "pindah", "kirim", "beli", "jual", "kerja"];
  const nounClues = ["kamar", "ruang", "jalan", "hari", "buku", "tas", "meja", "baju", "sekolah", "rumah", "mobil", "uang", "surat", "kertas"];
  const adjClues = ["senang", "sedih", "cepat", "lambat", "tinggi", "rendah", "cantik", "tampan", "murah", "mahal", "bersih", "kotor", "panas", "dingin"];

  if (verbClues.some(c => id.toLowerCase().includes(c))) {
    pool = verbPatterns;
  } else if (nounClues.some(c => id.toLowerCase().includes(c))) {
    pool = nounPatterns;
  } else if (adjClues.some(c => id.toLowerCase().includes(c))) {
    pool = adjPatterns;
  }

  return [
    pool[0](h, p, id),
    pool[1](h, p, id)
  ];
}

// Build the final 600 words array
const finalWords = wordsSummary.map(w => {
  const idMeaning = idTranslations[w.h] || w.en;
  const examples = getSentencesForWord(w, idMeaning);
  return {
    id: w.id,
    hanzi: w.h,
    pinyin: w.p,
    english: w.en,
    indonesian: idMeaning,
    characters: w.h.split(''),
    example: examples[0],
    examples: examples
  };
});

console.log(`Generated ${finalWords.length} words.`);
console.log('Sample word 1:', finalWords[0].hanzi, finalWords[0].examples.length, 'examples');
console.log('Sample word 100:', finalWords[99].hanzi, finalWords[99].examples[0].zh);

const outputPath = path.join(__dirname, '..', 'hsk4_data.js');
const jsContent = `// HSK 4 Vocabulary Data (600 Words - Multi-Sentence Practice Edition)
window.HSK4_WORDS = ${JSON.stringify(finalWords, null, 2)};
`;

fs.writeFileSync(outputPath, jsContent, 'utf-8');
console.log(`Successfully written to ${outputPath}!`);
