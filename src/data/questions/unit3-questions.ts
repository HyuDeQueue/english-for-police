import type { Question } from "@/types";

export const unit3Questions: Question[] = [
  {
    id: "u3_q1",
    type: "MCQ",
    prompt: "What does 'witness' mean?",
    circumstance: "You begin an interview after a street altercation.",
    options: ["Nạn nhân", "Nhân chứng", "Nghi phạm", "Điều tra"],
    answer: "Nhân chứng",
  },
  {
    id: "u3_q2",
    type: "FillInBlank",
    prompt: "Can you ____ the suspect?",
    circumstance: "You need appearance details for a quick suspect search.",
    answer: "describe",
  },
  {
    id: "u3_q3",
    type: "Dictation",
    prompt: "Anh/chị có chứng kiến sự việc xảy ra tại đây không?",
    circumstance: "You are identifying who directly saw the incident.",
    vnPrompt: "Anh/chị có chứng kiến sự việc xảy ra tại đây không?",
    answer: "Did you see what happened here?",
  },
  {
    id: "u3_q4",
    type: "Speaking",
    prompt: "Ông/bà có bị thương trong vụ việc không?",
    circumstance: "You assess victim condition before taking a statement.",
    vnPrompt: "Ông/bà có bị thương trong vụ việc không?",
    answer: "Were you injured during the incident?",
  },
  {
    id: "u3_q5",
    type: "Speaking",
    prompt: "Chúng tôi sẽ thông báo cho ông/bà khi có diễn biến tiếp theo.",
    circumstance:
      "You conclude an interview and set expectation for follow-up.",
    vnPrompt: "Chúng tôi sẽ thông báo cho ông/bà khi có diễn biến tiếp theo.",
    answer: "We will keep you informed of any further developments.",
  },
  {
    id: "u3_q6",
    type: "MCQ",
    prompt: "Which word means 'chứng cứ'?",
    circumstance: "You remind bystanders not to disturb important materials.",
    options: ["statement", "witness", "evidence", "scene"],
    answer: "evidence",
  },
  {
    id: "u3_q7",
    type: "MCQ",
    prompt: "What does 'incident' mean?",
    circumstance: "You classify the event in an official report.",
    options: ["Vụ việc", "Nhiệm vụ", "Biên bản", "Bằng chứng"],
    answer: "Vụ việc",
  },
  {
    id: "u3_q8",
    type: "FillInBlank",
    prompt: "Did the suspect have a ____?",
    circumstance: "You clarify immediate risk level for responding units.",
    answer: "weapon",
  },
  {
    id: "u3_q9",
    type: "Dictation",
    prompt: "Đối tượng tình nghi có nói gì không?",
    circumstance: "You collect verbal clues reported by witnesses.",
    vnPrompt: "Đối tượng tình nghi có nói gì không?",
    answer: "Did the suspect say anything?",
  },
  {
    id: "u3_q10",
    type: "Speaking",
    prompt: "Ông/bà hãy kể lại sự việc cho chúng tôi nghe.",
    circumstance: "You invite the victim to provide a clear narrative.",
    vnPrompt: "Ông/bà hãy kể lại sự việc cho chúng tôi nghe.",
    answer: "Can you tell me what happened?",
  },
  {
    id: "u3_q11",
    type: "FillInBlank",
    prompt: "Please answer as ____ as possible.",
    circumstance: "You request accurate details before recording testimony.",
    answer: "accurately",
  },
  {
    id: "u3_q12",
    type: "Speaking",
    prompt:
      "Nếu ông/bà nhớ thêm chi tiết nào, đề nghị thông báo cho chúng tôi.",
    circumstance: "You finish the interview and ask for future updates.",
    vnPrompt:
      "Nếu ông/bà nhớ thêm chi tiết nào, đề nghị thông báo cho chúng tôi.",
    answer: "Please inform us if you recall any additional details.",
  },
  {
    id: "u3_gap_1",
    type: "FillInBlank",
    prompt: "Did the suspect use any ____?",
    circumstance: "Gợi ý: weapon",
    answer: "weapon",
  },
  {
    id: "u3_arrange_1",
    type: "Arrangement",
    prompt:
      "Sắp xếp thành câu đúng: Can you describe the suspect's appearance?",
    options: ["Can", "you", "describe", "the", "suspect's", "appearance?"],
    answer: "Can you describe the suspect's appearance?",
  },
  {
    id: "u3_matching_1",
    type: "Matching",
    prompt: "Ghép các thuật ngữ với ý nghĩa tương ứng",
    pairs: [
      {
        left: "Witness",
        right: "Nhân chứng",
      },
      {
        left: "Suspect",
        right: "Đối tượng nghi vấn",
      },
      {
        left: "Victim",
        right: "Nạn nhân",
      },
      {
        left: "Evidence",
        right: "Chứng cứ",
      },
    ],
    answer: [
      "Witness:Nhân chứng",
      "Suspect:Đối tượng nghi vấn",
      "Victim:Nạn nhân",
      "Evidence:Chứng cứ",
    ],
  },
  {
    id: "u3_scenario_1",
    type: "Scenario",
    prompt:
      "Bạn đang ghi lời khai của một nạn nhân vụ mất cắp. Câu hỏi nào giúp làm rõ đặc điểm đối tượng?",
    scenarioDescription:
      "Nạn nhân vừa bị giật túi xách và đang rất hoảng loạn. Bạn cần thu thập thông tin để triển khai lực lượng truy tìm.",
    options: [
      "Where is your passport?",
      "Can you describe the suspect's appearance and clothing?",
      "Are you injured?",
      "Do not worry, we will help you.",
    ],
    answer: "Can you describe the suspect's appearance and clothing?",
    bestAnswer: "Can you describe the suspect's appearance and clothing?",
    explanation:
      "Câu B tập trung vào việc thu thập thông tin nhận dạng đối tượng, là ưu tiên hàng đầu để truy bắt.",
  },
  {
    id: "u3_sit_1",
    type: "Scenario",
    prompt: "Khi muốn hỏi nạn nhân có cần hỗ trợ y tế không:",
    options: [
      "Do you have a doctor?",
      "Would you like medical assistance?",
      "Are you dead?",
    ],
    answer: "Would you like medical assistance?",
  },
];
