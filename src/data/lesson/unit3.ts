import type { Unit } from "@/types";
import { unit3Questions } from "../questions/unit3-questions";

export const unit3: Unit = {
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
    {
      word: "crime scene",
      phonetic: "/kraɪm siːn/",
      meaning: "hiện trường vụ án",
      type: "Noun",
      example: "The crime scene must be protected.",
    },
    {
      word: "clarify",
      phonetic: "/ˈklærɪfaɪ/",
      meaning: "làm rõ",
      type: "Verb",
      example: "We need to clarify some details with you.",
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
  practice: unit3Questions,
};
