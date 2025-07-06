import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Shield,
  Mail,
  MapPin,
  Clock,
  User,
  Database,
  Lock,
  Eye,
  FileText,
} from "lucide-react";

const PrivacyPolicy: React.FC = () => {
  const sections = [
    {
      id: "overview",
      title: "1. Überblick",
      icon: Shield,
      content: `
        Diese Datenschutzerklärung informiert Sie über die Art, den Umfang und den Zweck der Verarbeitung personenbezogener Daten 
        durch die Royal Shisha Bar. Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst und behandeln Ihre personenbezogenen 
        Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
      `,
    },
    {
      id: "responsible",
      title: "2. Verantwortlicher",
      icon: User,
      content: `
        Verantwortlicher im Sinne der Datenschutz-Grundverordnung (DSGVO) ist:

        Royal Shisha Bar
        [Ihre Adresse]
        [PLZ Stadt]
        Deutschland

        E-Mail: royal.waldkraiburg@gmail.com
        Telefon: [Ihre Telefonnummer]
      `,
    },
    {
      id: "data-collection",
      title: "3. Datenerhebung und -verarbeitung",
      icon: Database,
      content: `
        Wir erheben und verarbeiten personenbezogene Daten in folgenden Bereichen:

        **Benutzerkonto:**
        - Name, E-Mail-Adresse, Telefonnummer
        - Benutzername und verschlüsseltes Passwort
        - Profilbild (optional)
        - Kontoerstellungsdatum und letzte Anmeldung

        **Reservierungen:**
        - Kontaktdaten (Name, E-Mail, Telefon)
        - Reservierungsdetails (Datum, Uhrzeit, Personenanzahl)
        - Besondere Wünsche oder Anforderungen

        **Bestellungen:**
        - Bestelldetails und Warenkorbinhalt
        - Tischnummer und Bestellzeitpunkt
        - Zahlungsinformationen (nur verarbeitungsrelevante Daten)

        **Treueprogramm:**
        - Stempelkarten-ID und Sammelpunkte
        - Bestellhistorie für Treuepunkte
        - Einlösung von Belohnungen

        **Technische Daten:**
        - IP-Adresse und Browser-Informationen
        - Cookie-Präferenzen
        - Nutzungsstatistiken (anonymisiert)
      `,
    },
    {
      id: "legal-basis",
      title: "4. Rechtsgrundlagen",
      icon: FileText,
      content: `
        Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf folgenden Rechtsgrundlagen:

        **Art. 6 Abs. 1 lit. a DSGVO (Einwilligung):**
        - Marketing-E-Mails und SMS
        - Nicht-notwendige Cookies
        - Datenanalyse zu Marketingzwecken

        **Art. 6 Abs. 1 lit. b DSGVO (Vertragserfüllung):**
        - Benutzerkonto-Verwaltung
        - Reservierungsabwicklung
        - Bestellungsverarbeitung
        - Treueprogramm-Teilnahme

        **Art. 6 Abs. 1 lit. f DSGVO (Berechtigte Interessen):**
        - Website-Sicherheit
        - Fraud-Prevention
        - Technische Notwendige Cookies
        - Anonyme Statistiken
      `,
    },
    {
      id: "data-sharing",
      title: "5. Datenweitergabe",
      icon: Eye,
      content: `
        Eine Übermittlung Ihrer persönlichen Daten an Dritte erfolgt nur:

        **Dienstleister (Auftragsverarbeiter):**
        - Firebase (Google) - Hosting und Datenspeicherung
        - Vercel - Website-Hosting
        - Zahlungsdienstleister (für Transaktionen)
        - E-Mail-Service-Provider (für Kommunikation)

        **Gesetzliche Verpflichtungen:**
        - Bei Vorliegen einer gerichtlichen Anordnung
        - Zur Erfüllung steuerlicher Pflichten
        - Bei Verdacht auf Straftaten

        Alle Dienstleister sind vertraglich zur Einhaltung der DSGVO verpflichtet.
      `,
    },
    {
      id: "data-retention",
      title: "6. Speicherdauer",
      icon: Clock,
      content: `
        Wir speichern Ihre Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist:

        **Benutzerkonto:** Bis zur Löschung des Kontos
        **Reservierungen:** 3 Jahre (steuerliche Aufbewahrungspflicht)
        **Bestellungen:** 10 Jahre (steuerliche und handelsrechtliche Aufbewahrungspflicht)
        **Treueprogramm:** Bis zur Beendigung der Teilnahme + 1 Jahr
        **Marketing-Einwilligungen:** Bis zum Widerruf
        **Technische Logs:** 30 Tage
        **Cookies:** Entsprechend Ihrer Cookie-Einstellungen

        Nach Ablauf der Speicherdauer werden die Daten automatisch gelöscht oder anonymisiert.
      `,
    },
    {
      id: "rights",
      title: "7. Ihre Rechte",
      icon: Lock,
      content: `
        Sie haben folgende Rechte bezüglich Ihrer personenbezogenen Daten:

        **Auskunftsrecht (Art. 15 DSGVO):**
        Recht auf Auskunft über die von uns verarbeiteten personenbezogenen Daten.

        **Berichtigungsrecht (Art. 16 DSGVO):**
        Recht auf Berichtigung unrichtiger oder unvollständiger Daten.

        **Löschungsrecht (Art. 17 DSGVO):**
        Recht auf Löschung Ihrer personenbezogenen Daten unter bestimmten Voraussetzungen.

        **Einschränkungsrecht (Art. 18 DSGVO):**
        Recht auf Einschränkung der Verarbeitung unter bestimmten Voraussetzungen.

        **Datenübertragbarkeit (Art. 20 DSGVO):**
        Recht auf Erhalt Ihrer Daten in einem strukturierten, gängigen Format.

        **Widerspruchsrecht (Art. 21 DSGVO):**
        Recht auf Widerspruch gegen die Verarbeitung aus berechtigten Interessen.

        **Widerruf von Einwilligungen:**
        Recht auf jederzeitigen Widerruf erteilter Einwilligungen.

        Zur Ausübung Ihrer Rechte wenden Sie sich an: royal.waldkraiburg@gmail.com
      `,
    },
    {
      id: "cookies",
      title: "8. Cookies und Tracking",
      icon: Database,
      content: `
        Unsere Website verwendet verschiedene Arten von Cookies:

        **Notwendige Cookies:**
        - Authentifizierung und Sicherheit
        - Warenkorb-Funktionalität
        - Session-Management
        Diese Cookies sind für das Funktionieren der Website erforderlich.

        **Funktionale Cookies:**
        - Spracheinstellungen
        - Benutzerpräferenzen
        - Chat-Support-Funktionen

        **Analyse-Cookies:**
        - Google Analytics (falls aktiviert)
        - Nutzungsstatistiken
        - Performance-Monitoring

        **Marketing-Cookies:**
        - Soziale Medien Integration
        - Werbe-Tracking
        - Remarketing-Funktionen

        Sie können Ihre Cookie-Präferenzen jederzeit in den Cookie-Einstellungen anpassen.
      `,
    },
    {
      id: "security",
      title: "9. Datensicherheit",
      icon: Shield,
      content: `
        Wir treffen umfangreiche Sicherheitsmaßnahmen zum Schutz Ihrer Daten:

        **Technische Maßnahmen:**
        - SSL/TLS-Verschlüsselung für alle Datenübertragungen
        - Sichere Passwort-Hashing-Verfahren
        - Regelmäßige Sicherheitsupdates
        - Firewall und Intrusion Detection
        - Backup und Recovery-Systeme

        **Organisatorische Maßnahmen:**
        - Zugriffskontrolle und Berechtigungsmanagement
        - Regelmäßige Sicherheitsschulungen
        - Datenschutz-Folgenabschätzungen
        - Incident-Response-Verfahren

        **Audit und Monitoring:**
        - Kontinuierliche Überwachung der Systeme
        - Regelmäßige Sicherheitsaudits
        - Penetrationstests
        - Compliance-Überprüfungen
      `,
    },
    {
      id: "international",
      title: "10. Internationale Datenübertragungen",
      icon: MapPin,
      content: `
        Ihre Daten werden teilweise an Dienstleister außerhalb der EU übertragen:

        **Google Firebase (USA):**
        - Angemessenheitsbeschluss der EU-Kommission
        - Zusätzliche Schutzmaßnahmen durch Standardvertragsklauseln
        - Privacy Shield Framework (soweit anwendbar)

        **Andere US-Dienstleister:**
        - Verwendung von Standardvertragsklauseln der EU-Kommission
        - Zusätzliche technische und organisatorische Maßnahmen
        - Regelmäßige Überprüfung der Schutzmaßnahmen

        Alle internationalen Übertragungen erfolgen nur mit angemessenen Garantien für den Datenschutz.
      `,
    },
    {
      id: "minors",
      title: "11. Minderjährige",
      icon: User,
      content: `
        Unsere Dienste richten sich nicht an Personen unter 16 Jahren. Wir erheben wissentlich keine 
        personenbezogenen Daten von Kindern unter 16 Jahren ohne die Einwilligung der Eltern oder 
        Erziehungsberechtigten.

        Falls Sie unter 16 Jahre alt sind, bitten wir Sie, keine personenbezogenen Daten über unsere 
        Website zu übermitteln, ohne vorherige Einwilligung Ihrer Eltern oder Erziehungsberechtigten.
      `,
    },
    {
      id: "contact",
      title: "12. Kontakt und Beschwerden",
      icon: Mail,
      content: `
        **Datenschutzbeauftragter:**
        Bei Fragen zum Datenschutz kontaktieren Sie uns unter:
        E-Mail: royal.waldkraiburg@gmail.com

        **Aufsichtsbehörde:**
        Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde zu beschweren:

        Bayerisches Landesamt für Datenschutzaufsicht (BayLDA)
        Promenade 18
        91522 Ansbach
        Telefon: 0981 180093-0
        E-Mail: poststelle@lda.bayern.de

        **Widerspruch gegen Datenverarbeitung:**
        Sofern Ihre personenbezogenen Daten auf Grundlage von berechtigten Interessen verarbeitet werden, 
        haben Sie das Recht, Widerspruch gegen diese Datenverarbeitung einzulegen.
      `,
    },
    {
      id: "changes",
      title: "13. Änderungen der Datenschutzerklärung",
      icon: FileText,
      content: `
        Wir behalten uns vor, diese Datenschutzerklärung bei Bedarf zu aktualisieren, um den aktuellen 
        rechtlichen Anforderungen zu entsprechen oder Änderungen unserer Leistungen umzusetzen.

        **Benachrichtigung über Änderungen:**
        - Wesentliche Änderungen werden per E-Mail mitgeteilt
        - Die aktuelle Version ist stets auf unserer Website verfügbar
        - Das Datum der letzten Aktualisierung ist am Ende dieser Erklärung vermerkt

        Wir empfehlen, diese Datenschutzerklärung regelmäßig zu überprüfen.
      `,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-charcoal via-gray-900 to-royal-charcoal py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-royal-gold mb-4">
            Datenschutzerklärung
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transparente Information über die Verarbeitung Ihrer
            personenbezogenen Daten gemäß der Datenschutz-Grundverordnung
            (DSGVO)
          </p>
          <div className="mt-6 text-sm text-gray-400">
            Letzte Aktualisierung: {new Date().toLocaleDateString("de-DE")}
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h2 className="text-xl font-semibold text-royal-gold mb-4">
              Schnellnavigation
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-2 text-sm text-gray-300 hover:text-royal-gold transition-colors p-2 rounded-lg hover:bg-white/5"
                >
                  <section.icon className="h-4 w-4" />
                  {section.title}
                </a>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Privacy Policy Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <motion.section
                key={section.id}
                id={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
                className="bg-white/5 backdrop-blur-sm rounded-xl p-6 md:p-8 border border-white/10"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="p-3 bg-royal-gold/20 rounded-lg">
                    <Icon className="h-6 w-6 text-royal-gold" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                      {section.title}
                    </h2>
                  </div>
                </div>

                <div className="prose prose-invert max-w-none">
                  {section.content.split("\n\n").map((paragraph, pIndex) => {
                    // Handle bold text
                    if (
                      paragraph.trim().startsWith("**") &&
                      paragraph.trim().endsWith("**")
                    ) {
                      return (
                        <h3
                          key={pIndex}
                          className="text-lg font-semibold text-royal-gold mt-6 mb-3"
                        >
                          {paragraph.replace(/\*\*/g, "")}
                        </h3>
                      );
                    }

                    // Handle list items
                    if (paragraph.trim().startsWith("- ")) {
                      const items = paragraph
                        .split("\n")
                        .filter((item) => item.trim().startsWith("- "));
                      return (
                        <ul
                          key={pIndex}
                          className="list-disc list-inside space-y-2 mb-4 text-gray-300"
                        >
                          {items.map((item, iIndex) => (
                            <li key={iIndex}>{item.replace("- ", "")}</li>
                          ))}
                        </ul>
                      );
                    }

                    // Regular paragraph
                    if (paragraph.trim()) {
                      return (
                        <p
                          key={pIndex}
                          className="text-gray-300 mb-4 leading-relaxed"
                        >
                          {paragraph.split("**").map((part, partIndex) =>
                            partIndex % 2 === 1 ? (
                              <strong
                                key={partIndex}
                                className="text-royal-gold font-semibold"
                              >
                                {part}
                              </strong>
                            ) : (
                              part
                            )
                          )}
                        </p>
                      );
                    }

                    return null;
                  })}
                </div>
              </motion.section>
            );
          })}
        </div>

        {/* Footer Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-royal-gold mb-4">
              Ihre Datenschutzrechte ausüben
            </h3>
            <p className="text-gray-300 mb-6">
              Sie können Ihre Rechte bezüglich Ihrer personenbezogenen Daten
              jederzeit ausüben.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/privacy-dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-royal-gold text-royal-charcoal font-semibold rounded-lg hover:bg-royal-gold/90 transition-colors"
              >
                <User className="h-5 w-5" />
                Datenschutz-Dashboard
              </Link>
              <a
                href="mailto:royal.waldkraiburg@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 border border-royal-gold text-royal-gold font-semibold rounded-lg hover:bg-royal-gold/10 transition-colors"
              >
                <Mail className="h-5 w-5" />
                Kontakt aufnehmen
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
