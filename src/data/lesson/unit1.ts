import type { Unit } from "@/types";
import { unit1Questions } from "../questions/unit1-questions";

export const unit1: Unit = {
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
    {
      word: "identification card (ID card)",
      phonetic: "/aɪˌdentɪfɪˈkeɪʃn kɑːd/",
      meaning: "thẻ căn cước/chứng minh nhân dân",
      type: "Noun",
      example: "May I see your ID card, please?",
    },
    {
      word: "driver's license",
      phonetic: "/ˈdraɪvəz ˈlaɪsns/",
      meaning: "bằng lái xe",
      type: "Noun",
      example: "Please show me your driver's license.",
    },
    {
      word: "residence permit",
      phonetic: "/ˈrezɪdəns ˈpɜːmɪt/",
      meaning: "giấy phép cư trú",
      type: "Noun",
      example: "Your residence permit is required for this registration.",
    },
    {
      word: "expired",
      phonetic: "/ɪkˈspaɪəd/",
      meaning: "hết hạn",
      type: "Adjective",
      example: "Your visa has expired.",
    },
    {
      word: "valid",
      phonetic: "/ˈvælɪd/",
      meaning: "có hiệu lực/còn hạn",
      type: "Adjective",
      example: "Is your passport still valid?",
    },
    {
      word: "permanent address",
      phonetic: "/ˈpɜːmənənt əˈdres/",
      meaning: "địa chỉ thường trú",
      type: "Expression",
      example: "What is your permanent address in your home country?",
    },
    {
      word: "temporary residence",
      phonetic: "/ˈtemprəri ˈrezɪdəns/",
      meaning: "tạm trú",
      type: "Noun",
      example:
        "You need to report your temporary residence to the local police.",
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
      translation: "Ông/bà đừng lo, chúng tôi đang nắm tình hình khu vực thôi.",
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
      translation: "Chúng tôi có mặt để hỗ trợ và bảo đảm an toàn cho ông/bà.",
      context: "Initial contact and introduction",
    },
    {
      text: "This check is required under current regulations.",
      translation: "Việc kiểm tra này được thực hiện theo quy định hiện hành.",
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
  practice: unit1Questions,
};
