/* Single config spot for the Retell AI website widget.
   Official embed: https://docs.retellai.com/deploy/chat-widget
   Fill these from the Retell dashboard (API Keys → Public Keys, plus the chat
   and voice agent IDs). Leave them as empty strings until the account exists.
   Do not invent keys. The page will not load the widget script while any
   required value is blank, so the draft will not show widget errors.
*/
window.QPM_RETELL = {
  /* Public key used for chat. Domain-restrict it to the future live host. */
  publicKey: "",
  /* Voice does not fall back to publicKey. Set this even if it is the same key. */
  voicePublicKey: "",
  /* Chat agent ID (data-agent-id). */
  chatAgentId: "",
  /* Voice agent ID (data-voice-agent-id). */
  voiceAgentId: ""
};
