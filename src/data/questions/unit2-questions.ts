import type { Question } from "@/types";

export const unit2Questions: Question[] = [
  {
    id: "u2_q1",
    type: "MCQ",
    prompt: "What does 'civilian' mean?",
    circumstance: "You are briefing a new officer before public interaction.",
    options: ["Nghi phạm", "Người dân", "Nạn nhân", "Nhân chứng"],
    answer: "Người dân",
  },
  {
    id: "u2_q2",
    type: "FillInBlank",
    prompt: "Please remain calm and ____. ",
    circumstance:
      "A crowd is gathering and you need compliance without escalation.",
    answer: "cooperative",
  },
  {
    id: "u2_q3",
    type: "Dictation",
    prompt: "Chúng tôi đang tuần tra khu vực.",
    circumstance: "You explain your presence to local residents at night.",
    vnPrompt: "Chúng tôi đang tuần tra khu vực.",
    answer: "We are conducting patrols in this area.",
  },
  {
    id: "u2_q4",
    type: "Speaking",
    prompt: "Đề nghị anh/chị giữ bình tĩnh và làm theo hướng dẫn.",
    circumstance: "A bystander is anxious while officers secure a scene.",
    vnPrompt: "Đề nghị anh/chị giữ bình tĩnh và làm theo hướng dẫn.",
    answer: "Please stay calm and follow our instructions.",
  },
  {
    id: "u2_q5",
    type: "MCQ",
    prompt: "What is the best translation of 'public order'?",
    circumstance:
      "You are translating key terms for a community safety workshop.",
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
    circumstance: "Someone questions your legal authority during a check.",
    vnPrompt: "Chúng tôi có thẩm quyền thực hiện nhiệm vụ này.",
    answer: "We are authorized to carry out this task.",
  },
  {
    id: "u2_q7",
    type: "MCQ",
    prompt: "What does 'lawful duty' mean?",
    circumstance: "You explain legal terminology to a foreign resident.",
    options: [
      "Nhiệm vụ theo quy định pháp luật",
      "Tình huống khẩn cấp",
      "Sự hướng dẫn",
      "Trật tự công cộng",
    ],
    answer: "Nhiệm vụ theo quy định pháp luật",
  },
  {
    id: "u2_q8",
    type: "FillInBlank",
    prompt: "Our duty is to ____ public order.",
    circumstance: "You describe police responsibilities in a public speech.",
    answer: "maintain",
  },
  {
    id: "u2_q9",
    type: "Dictation",
    prompt: "Việc này sẽ không mất nhiều thời gian.",
    circumstance: "A civilian worries that your questioning will delay them.",
    vnPrompt: "Việc này sẽ không mất nhiều thời gian.",
    answer: "This contact will not take long.",
  },
  {
    id: "u2_q10",
    type: "Speaking",
    prompt: "Chúng tôi sẽ hướng dẫn anh/chị đến đúng cơ quan.",
    circumstance: "You help a citizen who came to the wrong office.",
    vnPrompt: "Chúng tôi sẽ hướng dẫn anh/chị đến đúng cơ quan.",
    answer: "We will guide you to the appropriate office.",
  },
  {
    id: "u2_q11",
    type: "FillInBlank",
    prompt: "Please wait for further ____.",
    circumstance: "You are controlling a small crowd at a restricted area.",
    answer: "instructions",
  },
  {
    id: "u2_q12",
    type: "MCQ",
    prompt: "What does 'preventive' mean?",
    circumstance:
      "You explain why routine checks happen before incidents occur.",
    options: ["Phòng ngừa", "Hỗ trợ", "Đánh giá", "Tiếp cận"],
    answer: "Phòng ngừa",
  },
  {
    id: "u2_scenario_1",
    type: "Scenario",
    prompt:
      "Một nhóm du khách tụ tập chụp ảnh ở khu vực cấm. Bạn cần yêu cầu họ di chuyển. Câu nào phù hợp nhất?",
    scenarioDescription:
      "Tại một khu vực đang thi công gần điểm du lịch, một nhóm 5-6 du khách nước ngoài đang chụp ảnh và không nhận ra biển cấm. Họ không có hành vi xấu.",
    options: [
      "Get out of here now!",
      "For your safety, please keep clear of this area. We will guide you to a better spot.",
      "This area is restricted. Leave immediately.",
      "Please listen carefully to our instructions.",
    ],
    answer:
      "For your safety, please keep clear of this area. We will guide you to a better spot.",
    bestAnswer:
      "For your safety, please keep clear of this area. We will guide you to a better spot.",
    acceptableAnswers: ["Please listen carefully to our instructions."],
    explanation:
      "Câu B vừa cảnh báo vừa đề xuất giải pháp thay thế, thể hiện thái độ hỗ trợ. Câu D cũng chấp nhận được nhưng thiếu phần hướng dẫn cụ thể.",
  },
  {
    id: "u2_scenario_2",
    type: "Scenario",
    prompt:
      "Một người dân đến hỏi về thủ tục khai báo mất đồ nhưng bạn không phụ trách. Bạn nên nói gì?",
    scenarioDescription:
      "Bạn đang làm nhiệm vụ tuần tra thì một người nước ngoài tiến đến hỏi về thủ tục trình báo mất hành lý. Đây là trách nhiệm của bộ phận tiếp nhận tại trụ sở.",
    options: [
      "I can't help you with that.",
      "Please go to the local police office for further assistance. We will direct you to the appropriate department.",
      "Wait here, I will call someone.",
      "This matter can be resolved at the local police office.",
    ],
    answer:
      "Please go to the local police office for further assistance. We will direct you to the appropriate department.",
    bestAnswer:
      "Please go to the local police office for further assistance. We will direct you to the appropriate department.",
    acceptableAnswers: [
      "This matter can be resolved at the local police office.",
    ],
    explanation:
      "Câu B cung cấp hướng dẫn đầy đủ và chủ động nhất. Câu D cũng đúng nhưng chưa thể hiện sự sẵn sàng hỗ trợ dẫn đường.",
  },
  {
    id: "u2_gap_1",
    type: "FillInBlank",
    prompt: "We are authorized to ____ out this task.",
    circumstance: "Gợi ý: carry",
    answer: "carry",
  },
  {
    id: "u2_arrange_1",
    type: "Arrangement",
    prompt: "Sắp xếp thành câu đúng: Our duty is to maintain public order.",
    options: ["Our", "duty", "is", "to", "maintain", "public", "order."],
    answer: "Our duty is to maintain public order.",
  },
  {
    id: "u2_matching_1",
    type: "Matching",
    prompt: "Ghép các câu tiếng Anh với nội dung tương ứng",
    pairs: [
      {
        left: "How can we assist you today?",
        right: "Chúng tôi có thể hỗ trợ anh/chị vấn đề gì?",
      },
      {
        left: "Everything is under control.",
        right: "Tình hình đang được kiểm soát.",
      },
      {
        left: "Please step back.",
        right: "Đề nghị anh/chị lùi lại.",
      },
      {
        left: "Where is the lost and found office?",
        right: "Văn phòng tìm đồ thất lạc ở đâu?",
      },
    ],
    answer: [
      "How can we assist you today?:Chúng tôi có thể hỗ trợ anh/chị vấn đề gì?",
      "Everything is under control.:Tình hình đang được kiểm soát.",
      "Please step back.:Đề nghị anh/chị lùi lại.",
      "Where is the lost and found office?:Văn phòng tìm đồ thất lạc ở đâu?",
    ],
  },
  {
    id: "u2_sit_1",
    type: "Scenario",
    prompt: "Khi muốn trấn an người dân rằng tình hình đang được kiểm soát:",
    options: [
      "Don't move!",
      "Everything is under control.",
      "Why are you worried?",
    ],
    answer: "Everything is under control.",
  },
];
