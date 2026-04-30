import type { Question } from "@/types";

export const unit1Questions: Question[] = [
  {
    id: "u1_q1",
    type: "MCQ",
    prompt: "What does 'identification' mean?",
    circumstance:
      "You are conducting a routine ID check at a residential area.",
    options: ["Hộ chiếu", "Thị thực", "Giấy tờ tùy thân", "Địa chỉ"],
    answer: "Giấy tờ tùy thân",
  },
  {
    id: "u1_q2",
    type: "FillInBlank",
    prompt: "Please remain calm and ____ with us.",
    circumstance: "A foreign visitor looks nervous during first contact.",
    answer: "cooperate",
  },
  {
    id: "u1_q3",
    type: "Dictation",
    prompt: "Hộ chiếu của bạn ở đâu?",
    circumstance: "You need to confirm travel documents at a hotel lobby.",
    vnPrompt: "Ông/bà có mang theo hộ chiếu không?",
    answer: "Do you have your passport with you?",
  },
  {
    id: "u1_q4",
    type: "Speaking",
    prompt: "Tôi là cảnh sát đang làm nhiệm vụ.",
    circumstance:
      "Start a polite introduction before asking for personal details.",
    vnPrompt: "Chào ông/bà. Chúng tôi là Cảnh sát đang làm nhiệm vụ.",
    answer: "Good morning. We are police officers on duty.",
  },
  {
    id: "u1_q5",
    type: "FillInBlank",
    prompt: "This information is required for ____ purposes.",
    circumstance:
      "You explain why you are collecting a resident's information.",
    answer: "verification",
  },
  {
    id: "u1_q6",
    type: "Speaking",
    prompt: "Đề nghị ông/bà cho biết họ và tên đầy đủ.",
    circumstance: "You are recording identity details in an official form.",
    vnPrompt: "Đề nghị ông/bà cho biết họ và tên đầy đủ.",
    answer: "Could you please state your full name?",
  },
  {
    id: "u1_q7",
    type: "MCQ",
    prompt: "What does 'passport' mean?",
    circumstance: "You are checking if the traveler carries valid documents.",
    options: ["Hộ chiếu", "Thị thực", "Quốc tịch", "Địa chỉ"],
    answer: "Hộ chiếu",
  },
  {
    id: "u1_q8",
    type: "FillInBlank",
    prompt: "What is your ____?",
    circumstance:
      "You verify identity details from a temporary residence report.",
    answer: "nationality",
  },
  {
    id: "u1_q9",
    type: "Dictation",
    prompt: "Đề nghị ông/bà xuất trình giấy tờ tùy thân.",
    circumstance:
      "You request legal identification during a random inspection.",
    vnPrompt: "Đề nghị ông/bà xuất trình giấy tờ tùy thân.",
    answer: "Please show me your identification.",
  },
  {
    id: "u1_q10",
    type: "Speaking",
    prompt: "Đề nghị cho chúng tôi kiểm tra thị thực của ông/bà.",
    circumstance: "You verify immigration status after checking the passport.",
    vnPrompt: "Đề nghị cho chúng tôi kiểm tra thị thực của ông/bà.",
    answer: "May I check your visa?",
  },
  {
    id: "u1_q11",
    type: "FillInBlank",
    prompt: "Please provide your ____ in Vietnam.",
    circumstance: "You update lodging records for a foreign resident.",
    answer: "current address",
  },
  {
    id: "u1_q12",
    type: "MCQ",
    prompt: "Which word means 'xác minh'?",
    circumstance:
      "You summarize the purpose of document checking to a visitor.",
    options: ["assist", "verification", "contact", "cooperate"],
    answer: "verification",
  },
  {
    id: "u1_scenario_1",
    type: "Scenario",
    prompt:
      "Bạn gặp một người nước ngoài đang đi bộ trong khu dân cư vào ban đêm. Câu nào phù hợp nhất để mở đầu cuộc tiếp xúc?",
    scenarioDescription:
      "Bạn đang tuần tra khu dân cư lúc 22:00. Một người nước ngoài đi bộ một mình, trông có vẻ lạc đường. Bạn cần tiếp cận một cách lịch sự và chuyên nghiệp.",
    options: [
      "Stop! Show me your passport!",
      "Good evening. We are police officers on duty. May I speak with you for a moment?",
      "What are you doing here at night?",
      "Do you have your passport with you?",
    ],
    answer:
      "Good evening. We are police officers on duty. May I speak with you for a moment?",
    bestAnswer:
      "Good evening. We are police officers on duty. May I speak with you for a moment?",
    acceptableAnswers: ["Do you have your passport with you?"],
    explanation:
      "Câu B là phù hợp nhất vì giới thiệu công vụ rõ ràng, lịch sự và không gây hoảng sợ. Câu D cũng chấp nhận được nhưng thiếu phần giới thiệu.",
  },
  {
    id: "u1_scenario_2",
    type: "Scenario",
    prompt:
      "Một du khách từ chối xuất trình giấy tờ và tỏ ra lo lắng. Bạn nên nói gì?",
    scenarioDescription:
      "Trong quá trình kiểm tra giấy tờ tại khu du lịch, một du khách lắc đầu và lùi lại khi bạn yêu cầu xuất trình hộ chiếu. Họ có vẻ sợ hãi chứ không phải chống đối.",
    options: [
      "You must cooperate with us immediately!",
      "Please do not worry. This is a routine check. We are here to help and protect you.",
      "I will arrest you if you don't show your passport.",
      "This check is required under current regulations.",
    ],
    answer:
      "Please do not worry. This is a routine check. We are here to help and protect you.",
    bestAnswer:
      "Please do not worry. This is a routine check. We are here to help and protect you.",
    acceptableAnswers: ["This check is required under current regulations."],
    explanation:
      "Câu B giúp trấn an du khách và giải thích mục đích kiểm tra. Câu D cũng đúng nhưng thiếu sự đồng cảm cần thiết trong tình huống này.",
  },
  {
    id: "u1_arrange_1",
    type: "Arrangement",
    prompt: "Sắp xếp thành câu đúng: Officer Nam is the local police.",
    options: ["I", "am", "Officer", "Nam,", "from", "the", "local", "police."],
    answer: "I am Officer Nam, from the local police.",
  },
  {
    id: "u1_arrange_2",
    type: "Arrangement",
    prompt: "Sắp xếp thành câu đúng: We are on duty to ensure public safety.",
    options: ["We", "are", "on", "duty", "to", "ensure", "public", "safety."],
    answer: "We are on duty to ensure public safety.",
  },
  {
    id: "u1_arrange_3",
    type: "Arrangement",
    prompt: "Sắp xếp thành câu đúng: Please show your identification to me.",
    options: ["Please", "show", "me", "your", "identification."],
    answer: "Please show me your identification.",
  },
  {
    id: "u1_arrange_4",
    type: "Arrangement",
    prompt: "Sắp xếp thành câu đúng: Do you have your passport with you?",
    options: ["Do", "you", "have", "your", "passport", "with", "you?"],
    answer: "Do you have your passport with you?",
  },
  {
    id: "u1_arrange_5",
    type: "Arrangement",
    prompt:
      "Sắp xếp thành câu đúng: We will return your documents after verification.",
    options: [
      "We",
      "will",
      "return",
      "your",
      "documents",
      "after",
      "verification.",
    ],
    answer: "We will return your documents after verification.",
  },
  {
    id: "u1_matching_hd_1",
    type: "Matching",
    prompt: "Ghép các câu tiếng Anh với nội dung tương ứng",
    pairs: [
      {
        left: "This check is required under current regulations.",
        right:
          "This verification is conducted in accordance with current regulations.",
      },
      {
        left: "What is your current address in Vietnam?",
        right: "What is your current address in Vietnam?",
      },
      {
        left: "Do you have any other identification documents?",
        right: "Do you have any other identification documents?",
      },
      {
        left: "Is this personal information accurate?",
        right: "Is this personal information accurate?",
      },
    ],
    answer: [
      "This check is required under current regulations.:This verification is conducted in accordance with current regulations.",
      "What is your current address in Vietnam?:What is your current address in Vietnam?",
      "Do you have any other identification documents?:Do you have any other identification documents?",
      "Is this personal information accurate?:Is this personal information accurate?",
    ],
  },
  {
    id: "u1_gap_1",
    type: "FillInBlank",
    prompt: "We are here to ____ you.",
    circumstance: "Gợi ý: assist",
    answer: "assist",
  },
  {
    id: "u1_gap_2",
    type: "FillInBlank",
    prompt: "Please remain calm and ____ with us.",
    circumstance: "Gợi ý: cooperate",
    answer: "cooperate",
  },
  {
    id: "u1_gap_3",
    type: "FillInBlank",
    prompt: "Could you please ____ your full name?",
    circumstance: "Gợi ý: state",
    answer: "state",
  },
  {
    id: "u1_gap_4",
    type: "FillInBlank",
    prompt: "What is your ____ of birth?",
    circumstance: "Gợi ý: date",
    answer: "date",
  },
  {
    id: "u1_gap_5",
    type: "FillInBlank",
    prompt: "We need to ____ your identification documents.",
    circumstance: "Gợi ý: check hoặc verify",
    answer: "check",
    acceptableAnswers: ["verify"],
  },
  {
    id: "u1_sit_1",
    type: "Scenario",
    prompt: "When first approaching a foreigner to start working, you say:",
    options: [
      "Is this address correct?",
      "Good morning. We are police officers on duty.",
      "Give me your passport.",
    ],
    answer: "Good morning. We are police officers on duty.",
  },
  {
    id: "u1_sit_2",
    type: "Scenario",
    prompt:
      "When wanting to reassure a citizen that this is just a routine administrative check:",
    options: [
      "Please do not worry. We are making routine contact.",
      "You must stay here.",
      "Why are you here?",
    ],
    answer: "Please do not worry. We are making routine contact.",
  },
  {
    id: "u1_sit_3",
    type: "Scenario",
    prompt: "When needing to check a tourist's visa:",
    options: [
      "Do you like Vietnam?",
      "May I check your visa?",
      "Where is your visa?",
    ],
    answer: "May I check your visa?",
  },
  {
    id: "u1_sit_4",
    type: "Scenario",
    prompt:
      "When wanting to confirm whether the information a customer just provided is correct:",
    options: [
      "Please confirm this information.",
      "Tell me the truth.",
      "I don't believe you.",
    ],
    answer: "Please confirm this information.",
  },
  {
    id: "u1_sit_5",
    type: "Scenario",
    prompt: "When asking about a guest's current residence in Vietnam:",
    options: [
      "Where is your house in your country?",
      "What is your current place of residence in Vietnam?",
      "Do you have a hotel?",
    ],
    answer: "What is your current place of residence in Vietnam?",
  },
];
