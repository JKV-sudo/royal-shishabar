import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FileText,
  Users,
  CreditCard,
  Clock,
  Shield,
  Scale,
  User,
  Ban,
  CheckCircle,
  Info,
  Mail,
} from "lucide-react";

const AGB: React.FC = () => {
  const sections = [
    {
      id: "geltungsbereich",
      title: "§ 1 Geltungsbereich",
      icon: FileText,
      content: `
        **1.1** Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Leistungen der Royal Shisha Bar, 
        Stadtpl. 2, 84478 Waldkraiburg (nachfolgend "wir" oder "Royal Shisha Bar" genannt).

        **1.2** Diese AGB gelten gegenüber Verbrauchern und Unternehmern. Verbraucher ist jede natürliche Person, 
        die ein Rechtsgeschäft zu Zwecken abschließt, die überwiegend weder ihrer gewerblichen noch ihrer 
        selbständigen beruflichen Tätigkeit zugerechnet werden können.

        **1.3** Diese AGB gelten ausschließlich. Abweichende, entgegenstehende oder ergänzende AGB des Kunden 
        werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich schriftlich zugestimmt.
      `,
    },
    {
      id: "vertragsschluss",
      title: "§ 2 Vertragsschluss",
      icon: CheckCircle,
      content: `
        **2.1** Die Darstellung unserer Produkte und Dienstleistungen in der App/Website stellt kein rechtlich 
        bindendes Angebot dar, sondern einen unverbindlichen Online-Katalog.

        **2.2** Bei Reservierungen über unsere App/Website geben Sie durch Bestätigung Ihrer Reservierung ein 
        verbindliches Angebot zum Abschluss eines Vertrages ab. Der Vertrag kommt durch unsere Bestätigung 
        oder durch die tatsächliche Leistungserbringung zustande.

        **2.3** Bei Bestellungen erfolgt der Vertragsschluss mit Abgabe der Bestellung über unser Bestellsystem 
        vor Ort oder über die App.

        **2.4** Wir behalten uns vor, Verträge ohne Angabe von Gründen abzulehnen, insbesondere bei 
        Nichtverfügbarkeit von Plätzen oder bei begründeten Zweifeln an der Richtigkeit der Angaben.
      `,
    },
    {
      id: "leistungen",
      title: "§ 3 Unsere Leistungen",
      icon: Users,
      content: `
        **3.1 Restaurantbetrieb:**
        - Bewirtung mit Speisen und Getränken
        - Bereitstellung von Sitzplätzen
        - Service und Bedienung

        **3.2 Shisha-Service:**
        - Bereitstellung von Wasserpfeifen und Zubehör
        - Aufbau und Vorbereitung der Shishas
        - Beratung bei der Tabakauswahl
        - Wartung während der Nutzung

        **3.3 Reservierungsservice:**
        - Tischreservierung über App/Website oder Telefon
        - Verwaltung von Gruppenbuchungen
        - Event-Planung für besondere Anlässe

        **3.4 Digitale Services:**
        - Mobile App mit Bestell- und Reservierungsfunktion
        - Treueprogramm/Stempelpass
        - Online-Menü und Preisliste
      `,
    },
    {
      id: "preise-zahlung",
      title: "§ 4 Preise und Zahlung",
      icon: CreditCard,
      content: `
        **4.1** Es gelten die zum Zeitpunkt der Bestellung/Reservierung aktuellen Preise. Alle Preise verstehen 
        sich einschließlich der gesetzlichen Mehrwertsteuer.

        **4.2** Bei Vor-Ort-Bestellungen ist die Zahlung sofort bei Erhalt der Rechnung fällig. Akzeptiert werden:
        - Barzahlung
        - EC-Karte/Girocard
        - Kreditkarten (Visa, Mastercard)
        - Kontaktlose Zahlung (NFC)

        **4.3** Bei Reservierungen können wir eine Anzahlung oder Kaution verlangen, insbesondere bei 
        Gruppenbuchungen oder besonderen Events.

        **4.4** Preisänderungen bleiben vorbehalten. Bereits bestätigte Buchungen sind von Preiserhöhungen 
        nicht betroffen.

        **4.5** Bei Nichtzahlung oder Zahlungsverzug behalten wir uns vor, vom Vertrag zurückzutreten und 
        Schadensersatz zu verlangen.
      `,
    },
    {
      id: "reservierung-stornierung",
      title: "§ 5 Reservierung und Stornierung",
      icon: Clock,
      content: `
        **5.1 Reservierungen:**
        - Reservierungen sind bis zu 24 Stunden im Voraus möglich
        - Bei Verspätung von mehr als 15 Minuten ohne Benachrichtigung kann der Tisch anderweitig vergeben werden
        - Gruppenbuchungen ab 6 Personen erfordern eine telefonische Bestätigung

        **5.2 Stornierungen:**
        - Kostenlose Stornierung bis 4 Stunden vor dem Reservierungstermin
        - Stornierung zwischen 4 und 2 Stunden vorher: 50% der Mindestverzehrpflicht
        - Stornierung weniger als 2 Stunden vorher oder No-Show: 100% der Mindestverzehrpflicht

        **5.3 Mindestverzehr:**
        - Freitag und Samstag ab 19:00 Uhr: 25€ pro Person
        - Bei Gruppenbuchungen ab 8 Personen: 20€ pro Person
        - An Feiertagen und besonderen Events: nach Vereinbarung

        **5.4** Änderungen von Reservierungen sind bis 2 Stunden vor dem Termin kostenlos möglich.
      `,
    },
    {
      id: "nutzung-shisha",
      title: "§ 6 Nutzung der Shisha-Lounge",
      icon: Ban,
      content: `
        **6.1 Altersrestriktionen:**
        - Zutritt zur Shisha-Lounge nur für Personen ab 18 Jahren
        - Gültiger Personalausweis oder Reisepass erforderlich
        - Wir behalten uns vor, das Alter zu kontrollieren

        **6.2 Verhalten in der Lounge:**
        - Rauchverbot außerhalb der dafür vorgesehenen Bereiche
        - Leise Unterhaltung erwünscht, laute Musik oder Rufen ist untersagt
        - Respektvoller Umgang mit anderen Gästen und Personal
        - Hausordnung ist zu beachten

        **6.3 Shisha-Nutzung:**
        - Jede Shisha ist für maximal 4 Personen bestimmt
        - Weitergabe an andere Tische nicht gestattet
        - Bei Beschädigung durch unsachgemäße Nutzung wird Ersatz berechnet
        - Mitbringen eigener Tabaksorten nicht gestattet

        **6.4 Hausrecht:**
        - Wir behalten uns das Recht vor, Gäste bei Verstößen gegen die Hausordnung 
          oder unangemessenem Verhalten der Räumlichkeiten zu verweisen
        - Hausverbot kann bei wiederholten Verstößen ausgesprochen werden
      `,
    },
    {
      id: "treueprogramm",
      title: "§ 7 Treueprogramm/Stempelpass",
      icon: User,
      content: `
        **7.1 Teilnahme:**
        - Teilnahme ist kostenlos und freiwillig
        - Registrierung über unsere App oder vor Ort erforderlich
        - Ein Account pro Person

        **7.2 Sammeln von Stempeln:**
        - 1 Stempel pro 10€ Umsatz (Speisen und Getränke)
        - Stempel werden automatisch bei Zahlung gutgeschrieben
        - Nachträgliche Gutschrift nur am Tag des Kaufs möglich

        **7.3 Einlösung von Belohnungen:**
        - Belohnungen können nur bei vollständig gesammelten Karten eingelöst werden
        - Einlösung nur bei Anwesenheit möglich, nicht übertragbar
        - Belohnungen haben keine Gültigkeit über das Kalenderjahr hinaus

        **7.4 Ausschluss:**
        - Missbrauch oder Manipulation führt zum Ausschluss vom Programm
        - Bei Ausschluss verfallen alle gesammelten Stempel ohne Entschädigung
      `,
    },
    {
      id: "datenschutz",
      title: "§ 8 Datenschutz",
      icon: Shield,
      content: `
        **8.1** Wir erheben, verarbeiten und nutzen personenbezogene Daten nur im Rahmen der gesetzlichen 
        Bestimmungen. Details regelt unsere separate Datenschutzerklärung.

        **8.2** Bei der Nutzung unserer App werden bestimmte Daten automatisch erfasst und gespeichert. 
        Dies dient der ordnungsgemäßen Abwicklung unserer Dienstleistungen.

        **8.3** Ihre Einwilligung zur Datenverarbeitung können Sie jederzeit widerrufen. Dies berührt 
        nicht die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung.

        **8.4** Sie haben das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der 
        Verarbeitung Ihrer personenbezogenen Daten.
      `,
    },
    {
      id: "haftung",
      title: "§ 9 Haftung und Haftungsausschluss",
      icon: Scale,
      content: `
        **9.1** Wir haften nur für Schäden, die auf einer vorsätzlichen oder grob fahrlässigen 
        Pflichtverletzung unsererseits oder unserer Erfüllungsgehilfen beruhen.

        **9.2** Bei der Verletzung wesentlicher Vertragspflichten haften wir auch für leichte Fahrlässigkeit, 
        jedoch begrenzt auf den vertragstypischen, vorhersehbaren Schaden.

        **9.3** Die Haftung für Schäden an mitgebrachten Gegenständen ist ausgeschlossen, soweit diese 
        nicht in unsere Obhut gegeben wurden.

        **9.4** Für Diebstahl oder Beschädigung persönlicher Gegenstände übernehmen wir keine Haftung. 
        Wir empfehlen, Wertsachen nicht sichtbar liegen zu lassen.

        **9.5** Die Haftung auf Schadensersatz für leicht fahrlässige Pflichtverletzungen ist auf den 
        typischen, vorhersehbaren Schaden begrenzt.

        **9.6** Die Haftung für entgangenen Gewinn, mittelbare Schäden und Folgeschäden ist ausgeschlossen, 
        soweit nicht gesetzlich zwingend gehaftet wird.
      `,
    },
    {
      id: "widerruf",
      title: "§ 10 Widerrufsrecht für Verbraucher",
      icon: Info,
      content: `
        **10.1** Verbraucher haben bei Fernabsatzverträgen grundsätzlich ein 14-tägiges Widerrufsrecht. 
        
        **10.2** Das Widerrufsrecht erlischt bei:
        - Dienstleistungen, wenn wir mit der Ausführung vor Ende der Widerrufsfrist begonnen haben
        - Reservierungen für einen bestimmten Zeitpunkt
        - Speisen und Getränken, die bereits konsumiert wurden

        **10.3** Widerrufsbelehrung:**
        Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen.
        Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag des Vertragsschlusses.

        **10.4** Widerruf erfolgt durch eindeutige Erklärung an:
        Royal Shisha Bar, Stadtpl. 2, 84478 Waldkraiburg
        E-Mail: Royal.Waldkraiburg@gmail.com
      `,
    },
    {
      id: "schlussbestimmungen",
      title: "§ 11 Schlussbestimmungen",
      icon: FileText,
      content: `
        **11.1** Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts.

        **11.2** Gerichtsstand für alle Streitigkeiten ist, soweit gesetzlich zulässig, Waldkraiburg.

        **11.3** Sollten einzelne Bestimmungen dieser AGB unwirksam sein oder werden, berührt dies 
        nicht die Wirksamkeit der übrigen Bestimmungen.

        **11.4** Änderungen und Ergänzungen dieser AGB bedürfen der Schriftform. Dies gilt auch für 
        die Änderung dieser Schriftformklausel.

        **11.5** Wir sind berechtigt, diese AGB mit angemessener Frist zu ändern. Sie gelten als 
        genehmigt, wenn Sie nicht innerhalb von 4 Wochen nach Zugang der Änderungsmitteilung widersprechen.

        **11.6** Bei wiederholten Verstößen gegen diese AGB behalten wir uns vor, das Vertragsverhältnis 
        zu kündigen und ein Hausverbot auszusprechen.
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
            Allgemeine Geschäftsbedingungen
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Geschäftsbedingungen für die Nutzung der Services der Royal Shisha
            Bar
          </p>
          <div className="mt-6 text-sm text-gray-400">
            Stand: {new Date().toLocaleDateString("de-DE")} | Version 1.0
          </div>
        </motion.div>

        {/* Important Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
            <Info className="h-6 w-6 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-blue-300 font-semibold mb-1">
                Wichtiger Hinweis
              </h3>
              <p className="text-blue-200/80 text-sm">
                Mit der Nutzung unserer Services erklären Sie sich mit diesen
                Geschäftsbedingungen einverstanden. Bitte lesen Sie diese
                sorgfältig durch.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
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

        {/* AGB Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
              className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-royal-gold/20 rounded-lg">
                    <section.icon className="h-6 w-6 text-royal-gold" />
                  </div>
                  <h2 className="text-xl font-semibold text-white">
                    {section.title}
                  </h2>
                </div>
                <div className="prose prose-invert max-w-none">
                  {section.content.split("\n").map((paragraph, pIndex) => {
                    if (paragraph.trim() === "") return null;

                    // Handle bold text
                    if (
                      paragraph.trim().startsWith("**") &&
                      paragraph.trim().endsWith("**")
                    ) {
                      return (
                        <h4
                          key={pIndex}
                          className="text-royal-gold font-semibold text-base mt-3 mb-2"
                        >
                          {paragraph.trim().slice(2, -2)}
                        </h4>
                      );
                    }

                    // Handle bullet points
                    if (paragraph.trim().startsWith("- ")) {
                      return (
                        <li
                          key={pIndex}
                          className="text-gray-300 mb-1 ml-4 list-disc"
                        >
                          {paragraph.trim().slice(2)}
                        </li>
                      );
                    }

                    return (
                      <p
                        key={pIndex}
                        className="text-gray-300 mb-3 leading-relaxed"
                      >
                        {paragraph.trim()}
                      </p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact for Questions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0 }}
          className="mt-12"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-royal-gold mb-4 flex items-center gap-3">
              <Mail className="h-6 w-6" />
              Fragen zu den AGB?
            </h3>
            <p className="text-gray-300 mb-4">
              Bei Fragen zu diesen Geschäftsbedingungen oder unseren Services
              kontaktieren Sie uns gerne:
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="mailto:Royal.Waldkraiburg@gmail.com"
                className="inline-flex items-center gap-2 px-6 py-3 bg-royal-gold text-royal-charcoal font-semibold rounded-lg hover:bg-royal-gold/90 transition-colors"
              >
                <Mail className="h-5 w-5" />
                E-Mail senden
              </a>
              <a
                href="tel:+4915781413767"
                className="inline-flex items-center gap-2 px-6 py-3 border border-royal-gold text-royal-gold font-semibold rounded-lg hover:bg-royal-gold/10 transition-colors"
              >
                <Users className="h-5 w-5" />
                Anrufen
              </a>
            </div>
          </div>
        </motion.div>

        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-2 px-6 py-3 border border-royal-gold text-royal-gold font-semibold rounded-lg hover:bg-royal-gold/10 transition-colors"
            >
              <Shield className="h-5 w-5" />
              Datenschutzerklärung
            </Link>
            <Link
              to="/impressum"
              className="inline-flex items-center gap-2 px-6 py-3 border border-royal-gold text-royal-gold font-semibold rounded-lg hover:bg-royal-gold/10 transition-colors"
            >
              <FileText className="h-5 w-5" />
              Impressum
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AGB;
