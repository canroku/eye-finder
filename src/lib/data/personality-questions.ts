import type { PersonalityQuestion } from "@/lib/types";

const Q = (
  id: number,
  trait: PersonalityQuestion["trait"],
  text: string,
  left = "Hayır",
  right = "Evet",
): PersonalityQuestion => ({
  id: `q${id}`,
  text,
  trait,
  leftLabel: left,
  rightLabel: right,
});

const CORE: PersonalityQuestion[] = [
  Q(1, "extraversion", "Kalabalıklarda enerjik hissederim"),
  Q(2, "extraversion", "Yeni insanlarla tanışmayı severim"),
  Q(3, "extraversion", "Sosyal ortamlarda aktif olurum"),
  Q(4, "extraversion", "Yalnız kalmaktansa birlikte olmayı tercih ederim"),
  Q(5, "openness", "Seyahat ve yeni kültürler beni cezbeder"),
  Q(6, "openness", "Sanat ve yaratıcılık hayatımda önemli"),
  Q(7, "openness", "Yeni fikirlere açık bir insanım"),
  Q(8, "openness", "Rutinden sıkılır, değişiklik ararım"),
  Q(9, "agreeableness", "Başkalarının duygularına duyarlıyım"),
  Q(10, "agreeableness", "Tartışmalarda uzlaşmayı tercih ederim"),
  Q(11, "agreeableness", "Empati kurmak benim için kolay"),
  Q(12, "agreeableness", "Takım çalışmasında uyumluyum"),
  Q(13, "conscientiousness", "Planlı ve organize çalışırım"),
  Q(14, "conscientiousness", "Verdiğim sözleri tutarım"),
  Q(15, "conscientiousness", "Hedeflerime disiplinle ulaşırım"),
  Q(16, "conscientiousness", "Detaylara dikkat ederim"),
  Q(17, "emotional_stability", "Stresli durumlarda sakin kalırım"),
  Q(18, "emotional_stability", "Kolay panik yapmam"),
  Q(19, "emotional_stability", "Eleştiri karşısında dengeliyim"),
  Q(20, "emotional_stability", "Belirsizlik beni aşırı endişelendirmez"),
];

const EXTENDED: PersonalityQuestion[] = [
  Q(21, "extraversion", "Parti ve etkinliklerde merkezde olmayı severim"),
  Q(22, "extraversion", "Telefon görüşmelerinden yüz yüze sohbeti tercih ederim"),
  Q(23, "extraversion", "Grup projelerinde konuşkan tarafım"),
  Q(24, "extraversion", "Yeni ortamlara hızlı uyum sağlarım"),
  Q(25, "extraversion", "İnsanlarla vakit geçirmek beni şarj eder"),
  Q(26, "extraversion", "Sessiz ortamlarda sıkılırım"),
  Q(27, "extraversion", "İlk adımı atmaktan çekinmem"),
  Q(28, "extraversion", "Sosyal medyada aktif paylaşım yaparım"),
  Q(29, "extraversion", "Arkadaş çevrem geniş ve aktiftir"),
  Q(30, "extraversion", "Yalnız seyahat etmekten çok grup seyahatini severim"),
  Q(31, "extraversion", "Toplantılarda fikirlerimi açıkça söylerim"),
  Q(32, "extraversion", "Yeni hobileri insanlarla birlikte denerim"),

  Q(33, "openness", "Farklı mutfakları denemeyi severim"),
  Q(34, "openness", "Felsefe ve derin konular ilgimi çeker"),
  Q(35, "openness", "Geleneksel kalıplara meydan okumayı severim"),
  Q(36, "openness", "Yaratıcı projeler üretmekten keyif alırım"),
  Q(37, "openness", "Belgesel ve kültür programlarını izlerim"),
  Q(38, "openness", "Yeni teknolojileri erken denemeyi severim"),
  Q(39, "openness", "Alternatif müzik ve sanat türlerini keşfederim"),
  Q(40, "openness", "Farklı inanç ve görüşlere saygılıyım"),
  Q(41, "openness", "Hayal gücüm güçlüdür"),
  Q(42, "openness", "Spontane plan değişikliklerinden hoşlanırım"),
  Q(43, "openness", "Yabancı dil öğrenmek beni motive eder"),
  Q(44, "openness", "Soyut ve karmaşık fikirleri anlamayı severim"),

  Q(45, "agreeableness", "Çatışmadan kaçınmayı tercih ederim"),
  Q(46, "agreeableness", "Yardım isteyenlere zaman ayırırım"),
  Q(47, "agreeableness", "Başkalarının başarısını kutlarım"),
  Q(48, "agreeableness", "Affedici bir yapım vardır"),
  Q(49, "agreeableness", "İşbirliğine rekabetten çok değer veririm"),
  Q(50, "agreeableness", "Başkalarının ihtiyaçlarını kendi ihtiyaçlarımdan önce düşünürüm"),
  Q(51, "agreeableness", "Nazik ve saygılı iletişim kurarım"),
  Q(52, "agreeableness", "Gönüllü işlere katılmayı severim"),
  Q(53, "agreeableness", "Eleştiri yaparken yapıcı olmaya çalışırım"),
  Q(54, "agreeableness", "Güven veren biri olarak tanınırım"),
  Q(55, "agreeableness", "Farklı görüşleri dinlemeye açığım"),
  Q(56, "agreeableness", "Paylaşmayı cömertlikle yaparım"),

  Q(57, "conscientiousness", "Günlük rutinime sadık kalırım"),
  Q(58, "conscientiousness", "İşlerimi son dakikaya bırakmam"),
  Q(59, "conscientiousness", "Ev ve çalışma alanım düzenlidir"),
  Q(60, "conscientiousness", "Uzun vadeli hedefler belirlerim"),
  Q(61, "conscientiousness", "Sorumluluklarımı ertelemem"),
  Q(62, "conscientiousness", "Kalite için ekstra çaba harcarım"),
  Q(63, "conscientiousness", "Bütçemi ve harcamalarımı takip ederim"),
  Q(64, "conscientiousness", "Sözleşme ve taahhütlere dikkat ederim"),
  Q(65, "conscientiousness", "Öncelik listesi kullanırım"),
  Q(66, "conscientiousness", "Hata yaptığımda düzeltmeye odaklanırım"),
  Q(67, "conscientiousness", "Sağlıklı alışkanlıkları sürdürürüm"),
  Q(68, "conscientiousness", "Projeleri zamanında tamamlarım"),

  Q(69, "emotional_stability", "Olumsuz haberler beni uzun süre etkilemez"),
  Q(70, "emotional_stability", "Duygularımı kontrol edebilirim"),
  Q(71, "emotional_stability", "Baskı altında performansım düşmez"),
  Q(72, "emotional_stability", "Endişelerimi mantıkla yönetirim"),
  Q(73, "emotional_stability", "Ruh halim gün içinde aşırı dalgalanmaz"),
  Q(74, "emotional_stability", "Zor konuşmalarda sakin kalırım"),
  Q(75, "emotional_stability", "Hayal kırıklığından hızlı toparlanırım"),
  Q(76, "emotional_stability", "Kaygı yerine çözüm odaklıyım"),
  Q(77, "emotional_stability", "Kriz anlarında soğukkanlı kalırım"),
  Q(78, "emotional_stability", "Kendime güvenim stabildir"),
  Q(79, "emotional_stability", "Başarısızlığı öğrenme fırsatı görürüm"),
  Q(80, "emotional_stability", "Stres yönetimi tekniklerini uygularım"),
];

export const PERSONALITY_QUESTIONS_QUICK = CORE.slice(0, 16);
export const PERSONALITY_QUESTIONS = CORE;
export const PERSONALITY_QUESTIONS_DEEP = [...CORE, ...EXTENDED];

export type OnboardingMode = "quick" | "standard" | "deep";

export function getQuestionsForMode(mode: OnboardingMode): PersonalityQuestion[] {
  if (mode === "quick") return PERSONALITY_QUESTIONS_QUICK;
  if (mode === "deep") return PERSONALITY_QUESTIONS_DEEP;
  return PERSONALITY_QUESTIONS;
}

export const MIN_PERSONALITY_COMPLETION = 1;
