import { HistoricalMilestone } from '../types';

export const HISTORICAL_MILESTONES: HistoricalMilestone[] = [
  {
    id: 'bursa-fethi',
    year: 1326,
    title: 'Bursa\'nın Fethi (Pâyitaht)',
    subtitle: 'Osmanlı Beyliği\'nin İlk Başkenti',
    description: 'Osman Gazi\'nin kuşatmasıyla başlayan süreçte Orhan Gazi, stratejik sabır ve adaletli tutumuyla kenti 1326\'da fethetti.',
    details: 'Aproz (Evrenos) ve Köse Mihal gibi gazilerin desteğiyle Prusa şehri kansız teslim alındı. Şehir hemen beyliğin idari merkezi ve ilk başkenti yapıldı. Orhan Gazi şehri camiler, imaretler ve kervansaraylarla donatarak Gümüşlü Kümbet\'e babası Osman Gazi\'yi defnetti.',
    iconName: 'Castle',
    badge: 'PÂYİTAHT',
    quote: 'Bursa bizim poyraz esen kutlu beldemizdir. Adalet ve gaza bayrağını buraya diktik.',
    location: 'Bursa Hisarı & Gümüşlü Kümbet',
    region: 'Güney Marmara',
    keyFigures: ['Osman Gazi (Peder)', 'Orhan Gazi', 'Evrenos Bey', 'Köse Mihal']
  },
  {
    id: 'ilk-akce',
    year: 1327,
    title: 'İlk Osmanlı Akçesi (Menzil)',
    subtitle: 'Müstakil İktisat ve Devlet Mührü',
    description: 'Orhan Gazi adıyla basılan 1.15 gram ağırlığındaki gümüş para, Osmanlı Beyliği\'nin ekonomik bağımsızlığının nişanesidir.',
    details: 'Üzerinde "Duribe fî Bursa" (Bursa\'da basıldı) ve "Orhan bin Osman" ibaresi yer alır. Bu parayla birlikte İlhanlı tabiyetinden tam bağımsızlığa geçilmiş ve beylik müstakil devlet niteliği kazanmıştır.',
    iconName: 'Coins',
    badge: 'İKTİSAT',
    quote: 'Akçemiz gümüştür, sözümüz haktır. Beyliğimiz kendi mührüyle hükmeder.',
    location: 'Bursa Darphanesi',
    region: 'Bursa',
    keyFigures: ['Orhan Gazi', 'Vezir Alâeddin Paşa']
  },
  {
    id: 'iznik-medresesi',
    year: 1331,
    title: 'İznik\'in Fethi & İlk Medrese',
    subtitle: 'İlim ve Hukukun Temeli',
    description: 'İznik\'in fethinden hemen sonra Osmanlı Devleti\'nin ilk yükseköğretim kurumu olan Süleyman Paşa / İznik Medresesi açıldı.',
    details: 'Başmüderrisliğe dönemin en büyük alimi Davud-i Kayserî getirildi. Devlet organizasyonu sadece kılıçla değil, adalet ve hikmetle güçlendirildi.',
    iconName: 'BookOpen',
    badge: 'MEDRESE',
    quote: 'Kılıcın açtığı yolu ilim aydınlatmazsa, fethedilen toprak vatan olmaz.',
    location: 'İznik (Nicaea)',
    region: 'Kuzey Doğu Marmara',
    keyFigures: ['Orhan Gazi', 'Davud-i Kayserî (Başmüderris)', 'Süleyman Paşa']
  },
  {
    id: 'yaya-musellem',
    year: 1335,
    title: 'Yaya ve Müsellem Teşkilatı',
    subtitle: 'İlk Düzenli Osmanlı Ordusu',
    description: 'Vezir Çandarlı Kara Halil Paşa\'nın teklifiyle ilk maaşlı, sancağı ve üniforması olan muazzam piyade ve süvari teşkilatı kuruldu.',
    details: 'Aşiret kuvvetlerinden düzenli muvazzaf orduya geçiş sağlandı. Askerlere ak akçeli gündelik ve fetihte pay verildi. Kırmızı börk yerine ak börk giyme usulü getirildi.',
    iconName: 'Shield',
    badge: 'TEŞKİLAT',
    quote: 'Nizamlı ordu, sarsılmaz devlet demektir. Gazilerimiz tek bir sancak altında toplanmıştır.',
    location: 'Bursa & Bilecik',
    region: 'Anadolu Beylikler Hududu',
    keyFigures: ['Orhan Gazi', 'Çandarlı Kara Halil Paşa']
  },
  {
    id: 'nilufer-hatun',
    year: 1345,
    title: 'Nilüfer Hatun & İmar İmkânları',
    subtitle: 'Vakıf Medeniyeti ve İnsanı Yaşat Ki Devlet Yaşasın',
    description: 'Nilüfer Hatun (Holofira), Bursa ve İznik\'te yaptırdığı imaretler, aşevleri ve köprülerle vakıf kültürünü başlattı.',
    details: 'Nilüfer Çayı üzerindeki meşhur köprü ve İznik\'teki Nilüfer Hatun İmareti, fakirlere, seyyahlara ve ilim talebelerine kapısını ücretsiz açtı. İbn Batuta hatıralarında bu hayırseverliği övgüyle anlatır.',
    iconName: 'Scroll',
    badge: 'VAKIF',
    quote: 'İnsanı yaşat ki devlet yaşasın. Aşevlerimiz ve hayratımız garibanın sığınağıdır.',
    location: 'Bursa & Nilüfer Çayı',
    region: 'Bursa Havalisi',
    keyFigures: ['Nilüfer Hatun (Valide Sultan)', 'Orhan Gazi', 'Şehzade Murad (I. Murad)']
  },
  {
    id: 'cimpe-kalesi',
    year: 1354,
    title: 'Çimpe Kalesi & Rumeli\'ye Geçiş',
    subtitle: 'Gelibolu ve Avrupa Üssü',
    description: 'Orhan Gazi\'nin oğlu Şehzade Süleyman Paşa önderliğinde Çanakkale Boğazı geçilerek Rumeli\'deki ilk toprak parçası alındı.',
    details: 'Bizans imparatorluk taht mücadelesinde sağlanan yardımlar karşılığında Çimpe Kalesi Osmanlı\'ya devredildi. Burası Rumeli fütuhatının lojistik üssü haline getirildi ve Anadolu\'dan Türkmen nüfusu bölgeye iskan edildi.',
    iconName: 'Flag',
    badge: 'RUMELİ',
    quote: 'Rumeli toprağına basılan her adım, cihan devleti olma yolunda verilen yemindir.',
    location: 'Gelibolu / Çimpe Kalesi',
    region: 'Trakya & Rumeli',
    keyFigures: ['Şehzade Süleyman Paşa (Rumeli Fatihi)', 'Orhan Gazi', 'Ece Bey', 'Hacı İlbey']
  }
];
