import type { Unit } from '../types';

export const initialLessons: Unit[] = [
  {
    id: 1,
    title: "Traffic Safety & Vehicle Stops",
    description: "Nắm vững các thuật ngữ chuyên môn và cấu trúc câu trong việc tiếp cận và kiểm soát phương tiện giao thông.",
    vocabulary: [
      {
        word: "detain",
        phonetic: "/dɪˈteɪn/",
        meaning: "tạm giữ",
        type: "Verb",
        example: "The officer detained the suspect for questioning."
      },
      {
        word: "violation",
        phonetic: "/ˌvaɪəˈleɪʃn/",
        meaning: "sự vi phạm",
        type: "Noun",
        example: "You are being stopped for a traffic violation."
      },
      {
        word: "driver's license",
        phonetic: "/ˈdraɪvərz ˈlaɪsns/",
        meaning: "bằng lái xe",
        type: "Noun",
        example: "Please show me your driver's license and registration."
      }
    ],
    phrases: [
      {
        text: "Please step out of the vehicle.",
        translation: "Vui lòng bước ra khỏi xe.",
        context: "Yêu cầu đối tượng rời khỏi phương tiện để kiểm tra."
      },
      {
        text: "Keep your hands where I can see them.",
        translation: "Giữ tay ở vị trí tôi có thể nhìn thấy.",
        context: "Đảm bảo an toàn khi tiếp cận đối tượng."
      }
    ],
    memoryBoost: {
      collocations: [
        { verb: "issue", noun: "a fine" },
        { verb: "commit", noun: "a crime" },
        { verb: "obey", noun: "traffic laws" }
      ],
      summary: "Khi dừng xe, hãy luôn giữ thái độ chuyên nghiệp, yêu cầu giấy tờ rõ ràng và đảm bảo an toàn cho bản thân."
    },
    practice: [
      {
        id: "q1",
        type: "MCQ",
        prompt: "What does 'detain' mean?",
        options: ["Bắt giữ chính thức", "Tạm giữ", "Thả tự do", "Phạt tiền"],
        answer: "Tạm giữ"
      },
      {
        id: "q2",
        type: "FillInBlank",
        prompt: "The officer ____ the suspect for questioning.",
        answer: "detained"
      },
      {
        id: "q3",
        type: "Dictation",
        prompt: "Vui lòng bước ra khỏi xe.",
        vnPrompt: "Vui lòng bước ra khỏi xe.",
        answer: "Please step out of the vehicle."
      },
      {
        id: "q4",
        type: "Speaking",
        prompt: "Giữ tay ở vị trí tôi có thể nhìn thấy.",
        vnPrompt: "Giữ tay ở vị trí tôi có thể nhìn thấy.",
        answer: "Keep your hands where I can see them."
      }
    ]
  }
];
