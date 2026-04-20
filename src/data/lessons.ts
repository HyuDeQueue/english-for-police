import type { Unit } from "../types";

export const initialLessons: Unit[] = [
  {
    id: 1,
    title: "Initial Contact and Identity Check",
    description:
      "Tiếp xúc ban đầu và kiểm tra, xác minh giấy tờ tùy thân của người nước ngoài.",
    vocabulary: [
      {
        word: "identification (ID)",
        phonetic: "/aɪˌdentɪfɪˈkeɪʃn/",
        meaning: "giấy tờ tùy thân",
        type: "Noun",
        example: "Please show me your identification.",
      },
      {
        word: "passport",
        phonetic: "/ˈpɑːspɔːt/",
        meaning: "hộ chiếu",
        type: "Noun",
        example: "Do you have your passport with you?",
      },
      {
        word: "ensure",
        phonetic: "/ɪnˈʃʊər/",
        meaning: "bảo đảm",
        type: "Verb",
        example: "We are on duty to ensure public safety.",
      },
      {
        word: "cooperate",
        phonetic: "/koʊˈɒpəreɪt/",
        meaning: "hợp tác",
        type: "Verb",
        example: "Please remain calm and cooperate with us.",
      },
      {
        word: "conduct",
        phonetic: "/kənˈdʌkt/",
        meaning: "tiến hành, thực hiện",
        type: "Verb",
        example: "We are conducting routine patrols in this area.",
      },
      {
        word: "visa",
        phonetic: "/ˈviːzə/",
        meaning: "thị thực",
        type: "Noun",
        example: "May I check your visa?",
      },
      {
        word: "personal information",
        phonetic: "/ˈpɜːsənl ˌɪnfəˈmeɪʃn/",
        meaning: "thông tin cá nhân",
        type: "Expression",
        example: "Is this personal information accurate?",
      },
      {
        word: "full name",
        phonetic: "/fʊl neɪm/",
        meaning: "họ và tên",
        type: "Expression",
        example: "Could you please state your full name?",
      },
      {
        word: "date of birth",
        phonetic: "/deɪt əv bɜːθ/",
        meaning: "ngày sinh",
        type: "Expression",
        example: "What is your date of birth?",
      },
      {
        word: "nationality",
        phonetic: "/ˌnæʃəˈnæləti/",
        meaning: "quốc tịch",
        type: "Noun",
        example: "What is your nationality?",
      },
      {
        word: "contact",
        phonetic: "/ˈkɒntækt/",
        meaning: "tiếp xúc",
        type: "Noun",
        example: "We are making routine contact with people in this area.",
      },
      {
        word: "verify",
        phonetic: "/ˈverɪfaɪ/",
        meaning: "xác minh",
        type: "Verb",
        example: "Please provide your documents for verification.",
      },
      {
        word: "verification",
        phonetic: "/ˌverɪfɪˈkeɪʃn/",
        meaning: "xác minh",
        type: "Noun",
        example: "This information is required for verification purposes.",
      },
      {
        word: "be on duty",
        phonetic: "/ɒn ˈdjuːti/",
        meaning: "đang làm nhiệm vụ",
        type: "Adjective",
        example: "Good morning. We are police officers on duty.",
      },
      {
        word: "public safety",
        phonetic: "/ˈpʌblɪk ˈseɪfti/",
        meaning: "an toàn công cộng",
        type: "Expression",
        example: "We are on duty to ensure public safety.",
      },
      {
        word: "assist",
        phonetic: "/əˈsɪst/",
        meaning: "hỗ trợ",
        type: "Verb",
        example: "We are here to assist you.",
      },
      {
        word: "current address",
        phonetic: "/ˈkʌrənt əˈdres/",
        meaning: "địa chỉ cư trú hiện tại",
        type: "Expression",
        example: "Please provide your current address in Vietnam.",
      },
    ],
    phrases: [
      {
        text: "I am Officer [Name] from the local police.",
        translation: "Tôi là [Tên] - Cảnh sát khu vực.",
        context: "Initial contact and introduction",
      },
      {
        text: "Good morning/afternoon. We are police officers on duty.",
        translation: "Chào ông/bà. Chúng tôi là Cảnh sát đang làm nhiệm vụ.",
        context: "Initial contact and introduction",
      },
      {
        text: "We are on duty to ensure public safety.",
        translation:
          "Chúng tôi đang thực hiện nhiệm vụ bảo đảm an ninh, trật tự.",
        context: "Initial contact and introduction",
      },
      {
        text: "We are here to assist you.",
        translation: "Chúng tôi có mặt để hỗ trợ ông/bà.",
        context: "Initial contact and introduction",
      },
      {
        text: "Please remain calm and cooperate with us.",
        translation:
          "Đề nghị ông/bà giữ bình tĩnh và hợp tác với lực lượng chức năng.",
        context: "Initial contact and introduction",
      },
      {
        text: "Please do not worry. We are making routine contact with people in this area.",
        translation:
          "Ông/bà đừng lo, chúng tôi đang nắm tình hình khu vực thôi.",
        context: "Initial contact and introduction",
      },
      {
        text: "We are conducting routine patrols in this area.",
        translation: "Chúng tôi đang tuần tra thường xuyên tại khu vực này.",
        context: "Initial contact and introduction",
      },
      {
        text: "I would like to ask you a few questions.",
        translation:
          "Chúng tôi cần trao đổi và hỏi ông/bà một số nội dung liên quan.",
        context: "Initial contact and introduction",
      },
      {
        text: "We are here in accordance with our lawful duties.",
        translation:
          "Chúng tôi có mặt tại đây để thực hiện nhiệm vụ theo quy định pháp luật.",
        context: "Initial contact and introduction",
      },
      {
        text: "We are here to help and protect you.",
        translation:
          "Chúng tôi có mặt để hỗ trợ và bảo đảm an toàn cho ông/bà.",
        context: "Initial contact and introduction",
      },
      {
        text: "This check is required under current regulations.",
        translation:
          "Việc kiểm tra này được thực hiện theo quy định hiện hành.",
        context: "Requesting identification documents",
      },
      {
        text: "Please show me your identification.",
        translation: "Đề nghị ông/bà xuất trình giấy tờ tùy thân.",
        context: "Requesting identification documents",
      },
      {
        text: "Do you have your passport with you?",
        translation: "Ông/bà có mang theo hộ chiếu không?",
        context: "Requesting identification documents",
      },
      {
        text: "May I check your visa?",
        translation: "Đề nghị cho chúng tôi kiểm tra thị thực của ông/bà.",
        context: "Requesting identification documents",
      },
      {
        text: "Please provide your documents for verification.",
        translation: "Đề nghị ông/bà cung cấp giấy tờ để chúng tôi kiểm tra.",
        context: "Requesting identification documents",
      },
      {
        text: "Do you have any other identification documents?",
        translation: "Ông/bà còn giấy tờ tùy thân nào khác không?",
        context: "Requesting identification documents",
      },
      {
        text: "This information is required for verification purposes.",
        translation: "Thông tin này được yêu cầu để phục vụ công tác xác minh.",
        context: "Requesting identification documents",
      },
      {
        text: "Please present any valid identification document.",
        translation:
          "Đề nghị ông/bà xuất trình bất kỳ giấy tờ tùy thân hợp lệ nào.",
        context: "Requesting identification documents",
      },
      {
        text: "We need to check your identification documents.",
        translation: "Chúng tôi cần kiểm tra giấy tờ tùy thân của ông/bà.",
        context: "Requesting identification documents",
      },
      {
        text: "We will return your documents after verification.",
        translation:
          "Chúng tôi sẽ trả lại giấy tờ cho ông/bà sau khi kiểm tra, xác minh.",
        context: "Requesting identification documents",
      },
      {
        text: "Could you please state your full name?",
        translation: "Đề nghị ông/bà cho biết họ và tên đầy đủ.",
        context: "Verifying personal information",
      },
      {
        text: "What is your nationality?",
        translation: "Quốc tịch của ông/bà là gì?",
        context: "Verifying personal information",
      },
      {
        text: "What is your date of birth?",
        translation: "Ngày, tháng, năm sinh của ông/bà là gì?",
        context: "Verifying personal information",
      },
      {
        text: "What is your current place of residence in Vietnam?",
        translation: "Nơi cư trú hiện tại của ông/bà tại Việt Nam là ở đâu?",
        context: "Verifying personal information",
      },
      {
        text: "Is this address correct?",
        translation: "Địa chỉ này có chính xác không?",
        context: "Verifying personal information",
      },
      {
        text: "Please confirm this information.",
        translation: "Đề nghị ông/bà xác nhận lại thông tin này.",
        context: "Verifying personal information",
      },
      {
        text: "Please provide your current address in Vietnam.",
        translation:
          "Đề nghị ông/bà cung cấp địa chỉ cư trú hiện tại tại Việt Nam.",
        context: "Verifying personal information",
      },
      {
        text: "Is this personal information accurate?",
        translation: "Thông tin cá nhân này có chính xác không?",
        context: "Verifying personal information",
      },
      {
        text: "Have you updated your personal information recently?",
        translation:
          "Gần đây ông/bà có cập nhật thay đổi thông tin cá nhân không?",
        context: "Verifying personal information",
      },
      {
        text: "Please inform us if any of this information is incorrect.",
        translation:
          "Đề nghị ông/bà thông báo nếu có thông tin nào chưa chính xác.",
        context: "Verifying personal information",
      },
    ],
    memoryBoost: {
      collocations: [
        { verb: "show", noun: "identification" },
        { verb: "ensure", noun: "public safety" },
        { verb: "state", noun: "full name" },
        { verb: "provide", noun: "documents" },
        { verb: "verify", noun: "personal information" },
      ],
      summary:
        "Khi tiếp xúc ban đầu, cần giới thiệu công vụ rõ ràng, yêu cầu giấy tờ đúng quy định và xác minh thông tin cá nhân một cách lịch sự, chính xác.",
    },
    practice: [
      {
        id: "u1_q1",
        type: "MCQ",
        prompt: "What does 'identification' mean?",
        options: ["Hộ chiếu", "Thị thực", "Giấy tờ tùy thân", "Địa chỉ"],
        answer: "Giấy tờ tùy thân",
      },
      {
        id: "u1_q2",
        type: "FillInBlank",
        prompt: "Please remain calm and ____ with us.",
        answer: "cooperate",
      },
      {
        id: "u1_q3",
        type: "Dictation",
        prompt: "Hộ chiếu của bạn ở đâu?",
        vnPrompt: "Ông/bà có mang theo hộ chiếu không?",
        answer: "Do you have your passport with you?",
      },
      {
        id: "u1_q4",
        type: "Speaking",
        prompt: "Tôi là cảnh sát đang làm nhiệm vụ.",
        vnPrompt: "Chào ông/bà. Chúng tôi là Cảnh sát đang làm nhiệm vụ.",
        answer: "Good morning. We are police officers on duty.",
      },
      {
        id: "u1_q5",
        type: "FillInBlank",
        prompt: "This information is required for ____ purposes.",
        answer: "verification",
      },
      {
        id: "u1_q6",
        type: "Speaking",
        prompt: "Đề nghị ông/bà cho biết họ và tên đầy đủ.",
        vnPrompt: "Đề nghị ông/bà cho biết họ và tên đầy đủ.",
        answer: "Could you please state your full name?",
      },
    ],
  },
  {
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
        translation:
          "Chúng tôi đang thực hiện nhiệm vụ theo quy định pháp luật.",
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
        translation:
          "Nhiệm vụ của chúng tôi là giữ gìn trật tự an toàn xã hội.",
        context: "Explaining purpose and authority",
      },
      {
        text: "This is for preventive and safety purposes.",
        translation:
          "Hoạt động này nhằm mục đích phòng ngừa và đảm bảo an toàn.",
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
        translation:
          "Đề nghị anh/chị giữ bình tĩnh và không tụ tập đông người.",
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
    practice: [
      {
        id: "u2_q1",
        type: "MCQ",
        prompt: "What does 'civilian' mean?",
        options: ["Nghi phạm", "Người dân", "Nạn nhân", "Nhân chứng"],
        answer: "Người dân",
      },
      {
        id: "u2_q2",
        type: "FillInBlank",
        prompt: "Please remain calm and ____. ",
        answer: "cooperative",
      },
      {
        id: "u2_q3",
        type: "Dictation",
        prompt: "Chúng tôi đang tuần tra khu vực.",
        vnPrompt: "Chúng tôi đang tuần tra khu vực.",
        answer: "We are conducting patrols in this area.",
      },
      {
        id: "u2_q4",
        type: "Speaking",
        prompt: "Đề nghị anh/chị giữ bình tĩnh và làm theo hướng dẫn.",
        vnPrompt: "Đề nghị anh/chị giữ bình tĩnh và làm theo hướng dẫn.",
        answer: "Please stay calm and follow our instructions.",
      },
      {
        id: "u2_q5",
        type: "MCQ",
        prompt: "What is the best translation of 'public order'?",
        options: [
          "An toàn công cộng",
          "Trật tự công cộng",
          "Thẩm quyền",
          "Quy định",
        ],
        answer: "Trật tự công cộng",
      },
      {
        id: "u2_q6",
        type: "Speaking",
        prompt: "Chúng tôi có thẩm quyền thực hiện nhiệm vụ này.",
        vnPrompt: "Chúng tôi có thẩm quyền thực hiện nhiệm vụ này.",
        answer: "We are authorized to carry out this task.",
      },
    ],
  },
  {
    id: 3,
    title: "Receiving and Clarifying Incident Information",
    description:
      "Tiếp nhận và làm rõ thông tin vụ việc từ nhân chứng, nạn nhân và các bên liên quan.",
    vocabulary: [
      {
        word: "incident",
        phonetic: "/ˈɪnsɪdənt/",
        meaning: "vụ việc, sự cố",
        type: "Noun",
        example: "We need to ask you some questions regarding this incident.",
      },
      {
        word: "witness",
        phonetic: "/ˈwɪtnəs/",
        meaning: "nhân chứng",
        type: "Noun",
        example: "Are you a witness to this incident?",
      },
      {
        word: "victim",
        phonetic: "/ˈvɪktɪm/",
        meaning: "nạn nhân",
        type: "Noun",
        example: "The victim is safe now.",
      },
      {
        word: "suspect",
        phonetic: "/səˈspekt/",
        meaning: "nghi phạm/ đối tượng nghi vấn",
        type: "Noun",
        example: "Did you see the suspect?",
      },
      {
        word: "scene",
        phonetic: "/siːn/",
        meaning: "hiện trường",
        type: "Noun",
        example: "Did the suspect leave the scene immediately?",
      },
      {
        word: "occur",
        phonetic: "/əˈkɜːr/",
        meaning: "xảy ra",
        type: "Verb",
        example: "Can you specify the exact time the incident occurred?",
      },
      {
        word: "report",
        phonetic: "/rɪˈpɔːt/",
        meaning: "trình báo, báo cáo",
        type: "Expression",
        example: "Please report any additional details you recall.",
      },
      {
        word: "describe",
        phonetic: "/dɪˈskraɪb/",
        meaning: "mô tả",
        type: "Verb",
        example: "Can you describe the person involved?",
      },
      {
        word: "identify",
        phonetic: "/aɪˈdentɪfaɪ/",
        meaning: "nhận dạng",
        type: "Verb",
        example: "Please identify the person if possible.",
      },
      {
        word: "involved",
        phonetic: "/ɪnˈvɒlvd/",
        meaning: "liên quan",
        type: "Adjective",
        example: "Were there any other people involved?",
      },
      {
        word: "weapon",
        phonetic: "/ˈwepən/",
        meaning: "vũ khí",
        type: "Noun",
        example: "Did the suspect have a weapon?",
      },
      {
        word: "direction",
        phonetic: "/dɪˈrekʃn/",
        meaning: "hướng",
        type: "Noun",
        example: "Which direction did the suspect go?",
      },
      {
        word: "location",
        phonetic: "/ləʊˈkeɪʃn/",
        meaning: "địa điểm",
        type: "Noun",
        example: "Please confirm the exact location.",
      },
      {
        word: "injured",
        phonetic: "/ˈɪndʒəd/",
        meaning: "bị thương",
        type: "Adjective",
        example: "Were you injured during the incident?",
      },
      {
        word: "investigation",
        phonetic: "/ɪnˌvestɪˈɡeɪʃn/",
        meaning: "điều tra",
        type: "Noun",
        example: "Your information is important for the investigation.",
      },
      {
        word: "statement",
        phonetic: "/ˈsteɪtmənt/",
        meaning: "lời trình bày",
        type: "Noun",
        example: "Your statement will be recorded for further verification.",
      },
      {
        word: "evidence",
        phonetic: "/ˈevɪdəns/",
        meaning: "chứng cứ",
        type: "Noun",
        example: "Please do not touch any evidence at the scene.",
      },
    ],
    phrases: [
      {
        text: "We are police officers. We need to ask you some questions regarding this incident.",
        translation:
          "Chúng tôi là Cảnh sát. Chúng tôi cần hỏi anh/chị một số nội dung liên quan đến vụ việc này.",
        context: "Asking witnesses",
      },
      {
        text: "Did you see what happened here?",
        translation: "Anh/chị có chứng kiến sự việc xảy ra tại đây không?",
        context: "Asking witnesses",
      },
      {
        text: "Are you a witness to this incident?",
        translation: "Anh/chị có phải là người chứng kiến vụ việc này không?",
        context: "Asking witnesses",
      },
      {
        text: "What exactly did you see?",
        translation: "Anh/chị đã chứng kiến cụ thể những gì?",
        context: "Asking witnesses",
      },
      {
        text: "Did you see the suspect?",
        translation: "Anh/chị có nhìn thấy đối tượng nghi vấn không?",
        context: "Asking witnesses",
      },
      {
        text: "Can you describe the person involved?",
        translation: "Anh/chị có thể mô tả đặc điểm của người liên quan không?",
        context: "Asking witnesses",
      },
      {
        text: "Did the suspect have a weapon?",
        translation: "Đối tượng có mang theo hoặc sử dụng vũ khí không?",
        context: "Asking witnesses",
      },
      {
        text: "Did you notice any vehicle involved?",
        translation:
          "Anh/chị có phát hiện phương tiện nào liên quan đến vụ việc không?",
        context: "Asking witnesses",
      },
      {
        text: "Did you witness the incident from the beginning?",
        translation: "Anh/chị có chứng kiến vụ việc từ đầu không?",
        context: "Asking witnesses",
      },
      {
        text: "Did you notice anything unusual before the incident happened?",
        translation:
          "Trước khi vụ việc xảy ra, anh/chị có nhận thấy điều gì bất thường không?",
        context: "Asking witnesses",
      },
      {
        text: "We are police officers. You are safe now.",
        translation: "Chúng tôi là cảnh sát. Hiện tại ông/bà đã an toàn.",
        context: "Asking victims",
      },
      {
        text: "Can you tell me what happened?",
        translation: "Ông/bà hãy kể lại sự việc cho chúng tôi nghe.",
        context: "Asking victims",
      },
      {
        text: "Were you injured during the incident?",
        translation: "Ông/bà có bị thương trong vụ việc không?",
        context: "Asking victims",
      },
      {
        text: "Did anyone threaten or attack you?",
        translation: "Có ai đe dọa hoặc tấn công ông/bà không?",
        context: "Asking victims",
      },
      {
        text: "Do you know the person who did this?",
        translation: "Ông/bà có biết người đã thực hiện hành vi này không?",
        context: "Asking victims",
      },
      {
        text: "Can you describe the suspect?",
        translation: "Ông/bà có thể mô tả đặc điểm của đối tượng không?",
        context: "Asking victims",
      },
      {
        text: "Please take your time and tell us what happened.",
        translation: "Ông/bà cứ bình tĩnh, kể lại sự việc cho chúng tôi nghe.",
        context: "Asking victims",
      },
      {
        text: "Are you feeling well enough to answer a few questions?",
        translation:
          "Hiện tại ông/bà có đủ sức khỏe để trả lời câu hỏi của chúng tôi không?",
        context: "Asking victims",
      },
      {
        text: "We will ensure your safety while we handle this matter.",
        translation:
          "Chúng tôi sẽ bảo đảm an toàn cho ông/bà trong quá trình xử lý vụ việc.",
        context: "Asking victims",
      },
      {
        text: "Would you like medical assistance?",
        translation: "Ông/bà có cần chúng tôi hỗ trợ y tế không?",
        context: "Asking victims",
      },
      {
        text: "Please describe the sequence of events as clearly as possible.",
        translation:
          "Đề nghị ông/bà mô tả diễn biến sự việc một cách rõ ràng nhất có thể.",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "Can you specify the exact time the incident occurred?",
        translation:
          "Ông/bà có thể cho biết chính xác thời điểm vụ việc xảy ra không?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "Where did this happen exactly?",
        translation: "Chuyện này xảy ra chính xác ở đâu?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "What were you doing before it happened?",
        translation: "Trước khi sự việc xảy ra, ông/bà đang làm gì?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "What did the suspect do immediately after that?",
        translation: "Ngay sau đó, đối tượng đã có hành vi gì?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "Did the suspect say anything?",
        translation: "Đối tượng tình nghi có nói gì không?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "Were there any other people involved?",
        translation: "Có người nào khác liên quan không?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "Did the suspect leave the scene immediately?",
        translation: "Đối tượng tình nghi có rời khỏi hiện trường ngay không?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "Please answer as accurately as possible.",
        translation: "Yêu cầu ông/bà trả lời trung thực, chính xác.",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "What did the suspect carry with when leaving?",
        translation: "Đối tượng có mang theo gì khi rời đi không?",
        context: "Clarifying time, place, and actions",
      },
      {
        text: "We will review this information and proceed in accordance with the law.",
        translation:
          "Chúng tôi sẽ tiếp nhận, xem xét thông tin và xử lý theo đúng quy định pháp luật.",
        context: "Concluding the interview",
      },
      {
        text: "We will keep you informed of any further developments.",
        translation:
          "Chúng tôi sẽ thông báo cho ông/bà khi có diễn biến tiếp theo.",
        context: "Concluding the interview",
      },
      {
        text: "We appreciate your cooperation in this matter.",
        translation:
          "Chúng tôi ghi nhận và cảm ơn sự hợp tác của ông/bà trong vụ việc này.",
        context: "Concluding the interview",
      },
      {
        text: "Your statement will be recorded for further verification.",
        translation:
          "Lời trình bày của ông/bà sẽ được ghi nhận để phục vụ công tác xác minh tiếp theo.",
        context: "Concluding the interview",
      },
      {
        text: "Please keep your contact information available.",
        translation:
          "Đề nghị ông/bà giữ thông tin liên hệ để chúng tôi tiện liên lạc khi cần.",
        context: "Concluding the interview",
      },
      {
        text: "You may be requested to provide additional information later.",
        translation:
          "Sau này, ông/bà có thể được đề nghị cung cấp thêm thông tin.",
        context: "Concluding the interview",
      },
      {
        text: "If you have any further concerns, please contact the local police.",
        translation:
          "Nếu còn vấn đề gì cần trao đổi thêm, đề nghị ông/bà liên hệ Cảnh sát khu vực.",
        context: "Concluding the interview",
      },
      {
        text: "If necessary, we may contact you for further clarification.",
        translation:
          "Trong trường hợp cần thiết, chúng tôi có thể liên hệ lại để làm rõ thêm thông tin.",
        context: "Concluding the interview",
      },
      {
        text: "Please inform us if you recall any additional details.",
        translation:
          "Nếu ông/bà nhớ thêm chi tiết nào, đề nghị thông báo cho chúng tôi.",
        context: "Concluding the interview",
      },
      {
        text: "Thank you for providing the information.",
        translation: "Cảm ơn ông/bà đã cung cấp thông tin.",
        context: "Concluding the interview",
      },
    ],
    memoryBoost: {
      collocations: [
        { verb: "report", noun: "an incident" },
        { verb: "describe", noun: "the suspect" },
        { verb: "record", noun: "a statement" },
        { verb: "collect", noun: "evidence" },
        { verb: "conduct", noun: "an investigation" },
      ],
      summary:
        "Khi tiếp nhận thông tin vụ việc, cần hỏi rõ nhân chứng và nạn nhân, xác minh thời gian-địa điểm-hành vi, sau đó kết thúc bằng hướng dẫn rõ ràng về bước xử lý tiếp theo.",
    },
    practice: [
      {
        id: "u3_q1",
        type: "MCQ",
        prompt: "What does 'witness' mean?",
        options: ["Nạn nhân", "Nhân chứng", "Nghi phạm", "Điều tra"],
        answer: "Nhân chứng",
      },
      {
        id: "u3_q2",
        type: "FillInBlank",
        prompt: "Can you ____ the suspect?",
        answer: "describe",
      },
      {
        id: "u3_q3",
        type: "Dictation",
        prompt: "Anh/chị có chứng kiến sự việc xảy ra tại đây không?",
        vnPrompt: "Anh/chị có chứng kiến sự việc xảy ra tại đây không?",
        answer: "Did you see what happened here?",
      },
      {
        id: "u3_q4",
        type: "Speaking",
        prompt: "Ông/bà có bị thương trong vụ việc không?",
        vnPrompt: "Ông/bà có bị thương trong vụ việc không?",
        answer: "Were you injured during the incident?",
      },
      {
        id: "u3_q5",
        type: "Speaking",
        prompt: "Chúng tôi sẽ thông báo cho ông/bà khi có diễn biến tiếp theo.",
        vnPrompt:
          "Chúng tôi sẽ thông báo cho ông/bà khi có diễn biến tiếp theo.",
        answer: "We will keep you informed of any further developments.",
      },
      {
        id: "u3_q6",
        type: "MCQ",
        prompt: "Which word means 'chứng cứ'?",
        options: ["statement", "witness", "evidence", "scene"],
        answer: "evidence",
      },
    ],
  },
];
