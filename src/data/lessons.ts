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
        word: "verify",
        phonetic: "/ˈverɪfaɪ/",
        meaning: "xác minh",
        type: "Verb",
        example: "We need to verify your personal information.",
      },
      {
        word: "cooperate",
        phonetic: "/koʊˈɒpəreɪt/",
        meaning: "hợp tác",
        type: "Verb",
        example: "Please remain calm and cooperate with us.",
      },
      {
        word: "on duty",
        phonetic: "/ɒn ˈdjuːti/",
        meaning: "đang làm nhiệm vụ",
        type: "Adjective",
        example: "We are police officers on duty.",
      },
      {
        word: "nationality",
        phonetic: "/ˌnæʃəˈnæləti/",
        meaning: "quốc tịch",
        type: "Noun",
        example: "What is your nationality?",
      },
    ],
    phrases: [
      {
        text: "I am Officer [Name] from the local police.",
        translation: "Tôi là [Tên] - Cảnh sát khu vực.",
        context: "Giới thiệu bản thân và đơn vị công tác.",
      },
      {
        text: "Please remain calm and cooperate with us.",
        translation: "Đề nghị ông/bà giữ bình tĩnh và hợp tác với lực lượng chức năng.",
        context: "Trấn an và yêu cầu sự phối hợp từ đối tượng.",
      },
      {
        text: "Please show me your identification.",
        translation: "Đề nghị ông/bà xuất trình giấy tờ tùy thân.",
        context: "Yêu cầu kiểm tra giấy tờ.",
      },
      {
        text: "We will return your documents after verification.",
        translation: "Chúng tôi sẽ trả lại giấy tờ cho ông/bà sau khi kiểm tra, xác minh.",
        context: "Thông báo về việc trả lại giấy tờ sau khi kiểm tra xong.",
      },
    ],
    memoryBoost: {
      collocations: [
        { verb: "show", noun: "identification" },
        { verb: "ensure", noun: "public safety" },
        { verb: "state", noun: "full name" },
      ],
      summary:
        "Khi tiếp xúc ban đầu, hãy luôn giới thiệu bản thân rõ ràng, giữ thái độ lịch sự nhưng kiên quyết và giải thích mục đích của việc kiểm tra.",
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
    ],
  },
  {
    id: 2,
    title: "Traffic Safety & Vehicle Stops",
    description:
      "Nắm vững các thuật ngữ chuyên môn và cấu trúc câu trong việc tiếp cận và kiểm soát phương tiện giao thông.",
    vocabulary: [
      {
        word: "violation",
        phonetic: "/ˌvaɪəˈleɪʃn/",
        meaning: "sự vi phạm",
        type: "Noun",
        example: "You are being stopped for a traffic violation.",
      },
      {
        word: "driver's license",
        phonetic: "/ˈdraɪvərz ˈlaɪsns/",
        meaning: "bằng lái xe",
        type: "Noun",
        example: "Please show me your driver's license and registration.",
      },
    ],
    phrases: [
      {
        text: "Please step out of the vehicle.",
        translation: "Vui lòng bước ra khỏi xe.",
        context: "Yêu cầu đối tượng rời khỏi phương tiện để kiểm tra.",
      },
    ],
    memoryBoost: {
      collocations: [
        { verb: "issue", noun: "a fine" },
        { verb: "obey", noun: "traffic laws" },
      ],
      summary:
        "Khi dừng xe, hãy luôn giữ thái độ chuyên nghiệp, yêu cầu giấy tờ rõ ràng và đảm bảo an toàn cho bản thân.",
    },
    practice: [
      {
        id: "u2_q1",
        type: "MCQ",
        prompt: "What is 'driver's license'?",
        options: ["Hộ chiếu", "Bằng lái xe", "Thị thực", "Giấy khai sinh"],
        answer: "Bằng lái xe",
      },
    ],
  },
];
