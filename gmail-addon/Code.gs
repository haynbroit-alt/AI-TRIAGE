// Priorix — Gmail Add-on
// Configuration via Apps Script → Project Settings → Script Properties :
//   PRIORIX_API_URL   = https://your-deployment.vercel.app/api/triage
//   WEBHOOK_SECRET    = (même valeur que dans .env)

var DECISION_ICONS = {
  ACT: '🔴',
  WATCH: '🟡',
  IGNORE: '⚪'
};

var DECISION_LABELS = {
  ACT: 'Répondre maintenant',
  WATCH: 'Traiter plus tard',
  IGNORE: 'Archiver'
};

// ── Point d'entrée contextuel (email ouvert) ───────────────────────────────

function buildContextualCard(e) {
  var accessToken = e.gmail.accessToken;
  var messageId  = e.gmail.messageId;

  GmailApp.setCurrentMessageAccessToken(accessToken);
  var msg = GmailApp.getMessageById(messageId);

  var email = {
    from:    msg.getFrom(),
    subject: msg.getSubject(),
    body:    msg.getPlainBody().slice(0, 3000)
  };

  var result = callPriorix(email);

  if (result.error) {
    return buildErrorCard(result.error);
  }

  return buildResultCard(email, result);
}

// ── Appel API Priorix ──────────────────────────────────────────────────────

function callPriorix(email) {
  var props   = PropertiesService.getScriptProperties();
  var apiUrl  = props.getProperty('PRIORIX_API_URL');
  var secret  = props.getProperty('WEBHOOK_SECRET') || '';

  if (!apiUrl) {
    return { error: 'PRIORIX_API_URL non configurée dans Script Properties.' };
  }

  try {
    var response = UrlFetchApp.fetch(apiUrl, {
      method:          'post',
      contentType:     'application/json',
      headers:         { 'x-webhook-secret': secret },
      payload:         JSON.stringify(email),
      muteHttpExceptions: true
    });

    var code = response.getResponseCode();
    if (code !== 200) {
      return { error: 'API error ' + code };
    }

    return JSON.parse(response.getContentText());
  } catch (err) {
    return { error: String(err) };
  }
}

// ── Cartes UI ──────────────────────────────────────────────────────────────

function buildResultCard(email, result) {
  var decision = result.decision || 'IGNORE';
  var icon     = DECISION_ICONS[decision] || '⚪';
  var label    = DECISION_LABELS[decision] || '';

  var section = CardService.newCardSection()
    .addWidget(
      CardService.newDecoratedText()
        .setText(icon + ' ' + decision)
        .setBottomLabel(label)
        .setWrapText(false)
    )
    .addWidget(CardService.newDivider())
    .addWidget(
      CardService.newTextParagraph()
        .setText('<i>' + (result.reason || '') + '</i>')
    )
    .addWidget(CardService.newDivider())
    .addWidget(
      CardService.newKeyValue()
        .setTopLabel('Score global')
        .setContent((result.score || 0).toFixed(1) + ' / 10')
    )
    .addWidget(
      CardService.newKeyValue()
        .setTopLabel('Business')
        .setContent(String(result.business || 0) + ' / 10')
    )
    .addWidget(
      CardService.newKeyValue()
        .setTopLabel('Urgency')
        .setContent(String(result.urgency || 0) + ' / 10')
    )
    .addWidget(
      CardService.newKeyValue()
        .setTopLabel('Fit')
        .setContent(String(result.fit || 0) + ' / 10')
    );

  return CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle('Priorix')
        .setSubtitle(email.from)
    )
    .addSection(section)
    .build();
}

function buildErrorCard(message) {
  return CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle('Priorix')
        .setSubtitle('Erreur')
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph().setText('⚠️ ' + message)
        )
    )
    .build();
}

function buildHomeCard() {
  return CardService.newCardBuilder()
    .setHeader(
      CardService.newCardHeader()
        .setTitle('Priorix')
        .setSubtitle('Ouvrez un email pour l\'analyser')
    )
    .addSection(
      CardService.newCardSection()
        .addWidget(
          CardService.newTextParagraph()
            .setText('Priorix transforme chaque email en décision immédiate : ACT, WATCH ou IGNORE.')
        )
    )
    .build();
}
