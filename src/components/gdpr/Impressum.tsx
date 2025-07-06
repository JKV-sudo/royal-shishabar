import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin,
  Mail,
  Phone,
  User,
  Building,
  Scale,
  AlertTriangle,
  Shield,
  FileText,
  Globe,
} from "lucide-react";

const Impressum: React.FC = () => {
  const sections = [
    {
      id: "angaben",
      title: "Angaben gemäß § 5 TMG",
      icon: Building,
      content: `
        **Royal Shisha Bar**
        
        **Adresse:**
        Stadtpl. 2
        84478 Waldkraiburg
        Deutschland
        
        **Kontakt:**
        E-Mail: Royal.Waldkraiburg@gmail.com
        Telefon: +49 15781413767
      `,
    },
    {
      id: "vertreter",
      title: "Vertreten durch",
      icon: User,
      content: `
        **Geschäftsführung:**
        [Name des Geschäftsführers]
        
        **Handelsregister:**
        [Registereintrag falls vorhanden]
        [Registergericht]
        [Registernummer]
        
        **Umsatzsteuer-Identifikationsnummer:**
        [USt-IdNr. gemäß §27a Umsatzsteuergesetz]
      `,
    },
    {
      id: "verantwortlich",
      title: "Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV",
      icon: FileText,
      content: `
        **Verantwortlicher:**
        [Name des Verantwortlichen]
        Royal Shisha Bar
        Stadtpl. 2
        84478 Waldkraiburg
        Deutschland
        
        E-Mail: Royal.Waldkraiburg@gmail.com
      `,
    },
    {
      id: "streitschlichtung",
      title: "Streitschlichtung",
      icon: Scale,
      content: `
        **EU-Streitschlichtung:**
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
        https://ec.europa.eu/consumers/odr/
        
        Unsere E-Mail-Adresse finden Sie oben im Impressum.
        
        **Verbraucherstreitbeilegung/Universalschlichtungsstelle:**
        Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer 
        Verbraucherschlichtungsstelle teilzunehmen.
      `,
    },
    {
      id: "haftung-inhalte",
      title: "Haftung für Inhalte",
      icon: Shield,
      content: `
        Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den 
        allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht 
        unter der Verpflichtung, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach 
        Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
        
        Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen 
        Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt 
        der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden 
        Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
      `,
    },
    {
      id: "haftung-links",
      title: "Haftung für Links",
      icon: Globe,
      content: `
        Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. 
        Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der 
        verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. 
        
        Die verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. 
        Rechtswidrige Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente 
        inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer 
        Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige 
        Links umgehend entfernen.
      `,
    },
    {
      id: "urheberrecht",
      title: "Urheberrecht",
      icon: FileText,
      content: `
        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
        deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
        außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen 
        Autors bzw. Erstellers.
        
        Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen Gebrauch gestattet. 
        Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte 
        Dritter beachtet. Insbesondere werden Inhalte Dritter als solche gekennzeichnet. Sollten Sie 
        trotzdem auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden 
        Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte umgehend entfernen.
      `,
    },
    {
      id: "datenschutz",
      title: "Datenschutz",
      icon: Shield,
      content: `
        Der Schutz Ihrer persönlichen Daten ist uns ein wichtiges Anliegen. Wir behandeln Ihre 
        personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften 
        sowie dieser Datenschutzerklärung.
        
        Die Nutzung unserer Website ist in der Regel ohne Angabe personenbezogener Daten möglich. 
        Soweit auf unseren Seiten personenbezogene Daten (beispielsweise Name, Anschrift oder 
        E-Mail-Adressen) erhoben werden, erfolgt dies, soweit möglich, stets auf freiwilliger Basis.
        
        Wir weisen darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per 
        E-Mail) Sicherheitslücken aufweisen kann. Ein lückenloser Schutz der Daten vor dem Zugriff 
        durch Dritte ist nicht möglich.
        
        **Ausführliche Informationen finden Sie in unserer Datenschutzerklärung.**
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
            Impressum
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Angaben gemäß § 5 TMG und rechtliche Hinweise für Royal Shisha Bar
          </p>
          <div className="mt-6 text-sm text-gray-400">
            Stand: {new Date().toLocaleDateString("de-DE")}
          </div>
        </motion.div>

        {/* Notice Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-amber-300 font-semibold mb-1">
                Rechtlicher Hinweis
              </h3>
              <p className="text-amber-200/80 text-sm">
                Dieses Impressum erfüllt die Anforderungen des deutschen
                Telemediengesetzes (TMG) und der Datenschutz-Grundverordnung
                (DSGVO).
              </p>
            </div>
          </div>
        </motion.div>

        {/* Impressum Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <motion.div
              key={section.id}
              id={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
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
                        <h3
                          key={pIndex}
                          className="text-royal-gold font-semibold text-lg mt-4 mb-2"
                        >
                          {paragraph.trim().slice(2, -2)}
                        </h3>
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

        {/* Contact Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-xl font-semibold text-royal-gold mb-6 flex items-center gap-3">
              <Mail className="h-6 w-6" />
              Kontakt bei rechtlichen Fragen
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-royal-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Adresse</p>
                  <p className="text-gray-300 text-sm">
                    Stadtpl. 2<br />
                    84478 Waldkraiburg
                    <br />
                    Deutschland
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-royal-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">E-Mail</p>
                  <a
                    href="mailto:Royal.Waldkraiburg@gmail.com"
                    className="text-royal-gold hover:text-royal-gold/80 transition-colors text-sm"
                  >
                    Royal.Waldkraiburg@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-royal-gold mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-medium mb-1">Telefon</p>
                  <a
                    href="tel:+4915781413767"
                    className="text-royal-gold hover:text-royal-gold/80 transition-colors text-sm"
                  >
                    +49 15781413767
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="text-gray-400 text-sm">
                Bei Fragen zu diesem Impressum oder anderen rechtlichen
                Angelegenheiten kontaktieren Sie uns gerne über die oben
                genannten Kontaktdaten.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Legal Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/privacy-policy"
              className="inline-flex items-center gap-2 px-6 py-3 bg-royal-gold text-royal-charcoal font-semibold rounded-lg hover:bg-royal-gold/90 transition-colors"
            >
              <Shield className="h-5 w-5" />
              Datenschutzerklärung
            </Link>
            <Link
              to="/agb"
              className="inline-flex items-center gap-2 px-6 py-3 border border-royal-gold text-royal-gold font-semibold rounded-lg hover:bg-royal-gold/10 transition-colors"
            >
              <FileText className="h-5 w-5" />
              AGB
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Impressum;
