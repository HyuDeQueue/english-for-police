import type { Unit } from "@/types";
import { unit2Questions } from "../questions/unit2-questions";

export const unit2: Unit = {
  id: 2,
  title: "Public Interaction and General Assistance",
  description:
    "Giao tiếp công vụ và hỗ trợ người dân trong tình huống thông thường, không khẩn cấp.",
  vocabulary: [
    {
      word: "approach",
      phonetic: "/əˈprəʊtʃ/",
      meaning: "tiếp cận",
      type: "Verb",
      example: "Excuse me, may I approach and speak with you for a moment?",
    },
    {
      word: "greet",
      phonetic: "/ɡriːt/",
      meaning: "chào hỏi",
      type: "Verb",
      example: "Please greet civilians politely.",
    },
    {
      word: "civilian",
      phonetic: "/sɪˈvɪliən/",
      meaning: "người dân",
      type: "Noun",
      example: "The officer is speaking with a civilian.",
    },
    {
      word: "patrol",
      phonetic: "/pəˈtrəʊl/",
      meaning: "tuần tra",
      type: "Expression",
      example: "We are conducting patrols in this area.",
    },
    {
      word: "cooperate",
      phonetic: "/kəʊˈɒpəreɪt/",
      meaning: "hợp tác",
      type: "Verb",
      example: "Please cooperate so that we can complete our task quickly.",
    },
    {
      word: "lawful duty",
      phonetic: "/ˈlɔːfʊl ˈdjuːti/",
      meaning: "nhiệm vụ theo quy định pháp luật",
      type: "Expression",
      example: "We are carrying out our duties in accordance with the law.",
    },
    {
      word: "authority",
      phonetic: "/ɔːˈθɒrəti/",
      meaning: "thẩm quyền",
      type: "Noun",
      example: "We are authorized to carry out this task.",
    },
    {
      word: "public order",
      phonetic: "/ˈpʌblɪk ˈɔːdə/",
      meaning: "trật tự công cộng",
      type: "Expression",
      example: "Our duty is to maintain public order.",
    },
    {
      word: "preventive",
      phonetic: "/prɪˈventɪv/",
      meaning: "phòng ngừa",
      type: "Adjective",
      example: "This is for preventive and safety purposes.",
    },
    {
      word: "regulation",
      phonetic: "/ˌreɡjʊˈleɪʃn/",
      meaning: "quy định",
      type: "Noun",
      example:
        "This action is carried out in accordance with current regulations.",
    },
    {
      word: "assist",
      phonetic: "/əˈsɪst/",
      meaning: "hỗ trợ",
      type: "Verb",
      example: "How can we assist you today?",
    },
    {
      word: "guidance",
      phonetic: "/ˈɡaɪdəns/",
      meaning: "sự hướng dẫn",
      type: "Noun",
      example: "Please follow our guidance.",
    },
    {
      word: "instruction",
      phonetic: "/ɪnˈstrʌkʃn/",
      meaning: "chỉ dẫn",
      type: "Noun",
      example: "Please wait for further instructions.",
    },
    {
      word: "emergency",
      phonetic: "/ɪˈmɜːdʒənsi/",
      meaning: "tình huống khẩn cấp",
      type: "Noun",
      example: "This is not an emergency situation.",
    },
    {
      word: "safety",
      phonetic: "/ˈseɪfti/",
      meaning: "an toàn",
      type: "Noun",
      example: "We are here to assist and ensure safety.",
    },
    {
      word: "assess",
      phonetic: "/əˈses/",
      meaning: "đánh giá",
      type: "Verb",
      example: "We are checking and assessing the situation in this area.",
    },
    {
      word: "situation",
      phonetic: "/ˌsɪtʃuˈeɪʃn/",
      meaning: "tình huống",
      type: "Noun",
      example: "Everything is under control in this situation.",
    },
  ],
  phrases: [
    {
      text: "Excuse me, may I speak with you for a moment?",
      translation: "Xin lỗi anh/chị, chúng tôi cần trao đổi với anh/chị.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "Please don't worry. This is a routine contact.",
      translation:
        "Anh/chị không cần lo lắng, đây là tiếp xúc thông thường theo quy định.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "We are conducting patrols in this area.",
      translation: "Chúng tôi đang tuần tra khu vực.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "May I ask you a few basic questions?",
      translation: "Chúng tôi cần hỏi anh/chị một số câu hỏi cơ bản.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "Please remain calm and cooperative.",
      translation: "Đề nghị anh/chị giữ bình tĩnh và hợp tác.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "We are checking the situation in this area.",
      translation: "Chúng tôi đang nắm tình hình tại khu vực này.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "Please cooperate so that we can complete our task quickly.",
      translation:
        "Đề nghị anh/chị hợp tác để chúng tôi hoàn thành nhiệm vụ nhanh chóng.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "This contact will not take long.",
      translation: "Việc này sẽ không mất nhiều thời gian.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "We are here to assist and ensure safety.",
      translation: "Chúng tôi có mặt để hỗ trợ và bảo đảm an toàn.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "Please listen carefully to our instructions.",
      translation: "Đề nghị anh/chị lắng nghe hướng dẫn.",
      context: "Approaching and greeting civilians",
    },
    {
      text: "We are carrying out our duties in accordance with the law.",
      translation: "Chúng tôi đang thực hiện nhiệm vụ theo quy định pháp luật.",
      context: "Explaining purpose and authority",
    },
    {
      text: "This is a routine check for public order and safety.",
      translation:
        "Đây là hoạt động kiểm tra thường xuyên nhằm đảm bảo an ninh, trật tự.",
      context: "Explaining purpose and authority",
    },
    {
      text: "We are authorized to carry out this task.",
      translation: "Chúng tôi có thẩm quyền thực hiện nhiệm vụ này.",
      context: "Explaining purpose and authority",
    },
    {
      text: "This action is carried out in accordance with current regulations.",
      translation: "Hoạt động này phù hợp với quy định hiện hành.",
      context: "Explaining purpose and authority",
    },
    {
      text: "Our duty is to maintain public order.",
      translation: "Nhiệm vụ của chúng tôi là giữ gìn trật tự an toàn xã hội.",
      context: "Explaining purpose and authority",
    },
    {
      text: "This is for preventive and safety purposes.",
      translation: "Hoạt động này nhằm mục đích phòng ngừa và đảm bảo an toàn.",
      context: "Explaining purpose and authority",
    },
    {
      text: "We will explain everything clearly.",
      translation: "Chúng tôi sẽ giải thích rõ ràng các nội dung liên quan.",
      context: "Explaining purpose and authority",
    },
    {
      text: "Please follow the legal instructions given.",
      translation:
        "Đề nghị anh/chị chấp hành các yêu cầu, hướng dẫn theo quy định pháp luật.",
      context: "Explaining purpose and authority",
    },
    {
      text: "Our actions are carried out in accordance with current legal regulations.",
      translation:
        "Mọi hoạt động của chúng tôi đều căn cứ theo quy định pháp luật hiện hành.",
      context: "Explaining purpose and authority",
    },
    {
      text: "We are authorized to request your cooperation in this matter.",
      translation:
        "Chúng tôi có thẩm quyền yêu cầu anh/chị hợp tác trong nội dung này.",
      context: "Explaining purpose and authority",
    },
    {
      text: "How can we assist you today?",
      translation: "Chúng tôi có thể hỗ trợ anh/chị vấn đề gì?",
      context: "Providing general assistance",
    },
    {
      text: "Please let us know if you need any assistance.",
      translation: "Nếu cần hỗ trợ, đề nghị anh/chị thông báo cho chúng tôi.",
      context: "Providing general assistance",
    },
    {
      text: "We will guide you to the appropriate office.",
      translation: "Chúng tôi sẽ hướng dẫn anh/chị đến đúng cơ quan.",
      context: "Providing general assistance",
    },
    {
      text: "This matter can be resolved at the local police office.",
      translation:
        "Vấn đề này anh/chị cần đến trụ sở Công an phường để giải quyết.",
      context: "Providing general assistance",
    },
    {
      text: "We will provide you with the necessary information.",
      translation: "Chúng tôi sẽ cung cấp cho anh/chị thông tin cần thiết.",
      context: "Providing general assistance",
    },
    {
      text: "This is not an emergency situation.",
      translation: "Đây không phải là tình huống khẩn cấp.",
      context: "Providing general assistance",
    },
    {
      text: "We are here to support the public.",
      translation: "Chúng tôi có mặt để phục vụ nhân dân.",
      context: "Providing general assistance",
    },
    {
      text: "We will assist you in accordance with regulations.",
      translation: "Chúng tôi sẽ hỗ trợ anh/chị theo đúng quy định.",
      context: "Providing general assistance",
    },
    {
      text: "Please go to the local police office for further assistance.",
      translation:
        "Đề nghị anh/chị đến trụ sở Công an phường để được hỗ trợ thêm.",
      context: "Providing general assistance",
    },
    {
      text: "We will direct you to the appropriate department.",
      translation:
        "Chúng tôi sẽ hướng dẫn anh/chị đến đúng bộ phận có thẩm quyền.",
      context: "Providing general assistance",
    },
    {
      text: "You may return later if you need further assistance.",
      translation: "Anh/chị có thể quay lại khi cần hỗ trợ thêm.",
      context: "Providing general assistance",
    },
    {
      text: "Please stay calm and follow our instructions.",
      translation: "Đề nghị anh/chị giữ bình tĩnh và làm theo hướng dẫn.",
      context: "Calming and guiding civilians",
    },
    {
      text: "There is no immediate danger at the moment.",
      translation: "Hiện tại không có gì nguy hiểm trực tiếp cả.",
      context: "Calming and guiding civilians",
    },
    {
      text: "Everything is under control.",
      translation: "Tình hình đang được kiểm soát.",
      context: "Calming and guiding civilians",
    },
    {
      text: "Please keep calm and do not crowd around.",
      translation: "Đề nghị anh/chị giữ bình tĩnh và không tụ tập đông người.",
      context: "Calming and guiding civilians",
    },
    {
      text: "Please step back and keep a safe distance.",
      translation: "Đề nghị anh/chị lùi lại và giữ khoảng cách an toàn.",
      context: "Calming and guiding civilians",
    },
    {
      text: "Do not panic. We are here to help.",
      translation: "Đề nghị anh/chị không hoảng loạn, chúng tôi đang hỗ trợ.",
      context: "Calming and guiding civilians",
    },
    {
      text: "Please wait for further instructions.",
      translation: "Đề nghị chờ hướng dẫn tiếp theo.",
      context: "Calming and guiding civilians",
    },
    {
      text: "We will provide further instructions if necessary.",
      translation: "Khi cần thiết, chúng tôi sẽ hướng dẫn thêm.",
      context: "Calming and guiding civilians",
    },
    {
      text: "Please move to a safe area and follow our guidance.",
      translation:
        "Đề nghị anh/chị di chuyển đến khu vực an toàn và thực hiện theo hướng dẫn.",
      context: "Calming and guiding civilians",
    },
    {
      text: "For your safety, please keep clear of this area.",
      translation: "Đề nghị anh/chị tránh xa khu vực này để bảo đảm an toàn.",
      context: "Calming and guiding civilians",
    },
  ],
  memoryBoost: {
    collocations: [
      { verb: "conduct", noun: "patrols" },
      { verb: "maintain", noun: "public order" },
      { verb: "follow", noun: "instructions" },
      { verb: "provide", noun: "guidance" },
      { verb: "assess", noun: "situation" },
    ],
    summary:
      "Trong giao tiếp công vụ, cần tiếp cận lịch sự, giải thích rõ thẩm quyền pháp lý, hỗ trợ người dân đúng quy định và hướng dẫn bình tĩnh trong các tình huống công cộng.",
  },
  practice: unit2Questions,
};
