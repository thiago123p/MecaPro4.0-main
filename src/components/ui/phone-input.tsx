import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CountryCode {
  code: string;
  country: string;
  flag: string;
}

const countryCodes: CountryCode[] = [
  { code: "+55", country: "Brasil", flag: "🇧🇷" },
  { code: "+1", country: "Estados Unidos", flag: "🇺🇸" },
  { code: "+1", country: "Canadá", flag: "🇨🇦" },
  { code: "+44", country: "Reino Unido", flag: "🇬🇧" },
  { code: "+49", country: "Alemanha", flag: "🇩🇪" },
  { code: "+33", country: "França", flag: "🇫🇷" },
  { code: "+39", country: "Itália", flag: "🇮🇹" },
  { code: "+34", country: "Espanha", flag: "🇪🇸" },
  { code: "+351", country: "Portugal", flag: "🇵🇹" },
  { code: "+52", country: "México", flag: "🇲🇽" },
  { code: "+54", country: "Argentina", flag: "🇦🇷" },
  { code: "+56", country: "Chile", flag: "🇨🇱" },
  { code: "+57", country: "Colômbia", flag: "🇨🇴" },
  { code: "+58", country: "Venezuela", flag: "🇻🇪" },
  { code: "+51", country: "Peru", flag: "🇵🇪" },
  { code: "+593", country: "Equador", flag: "🇪🇨" },
  { code: "+595", country: "Paraguai", flag: "🇵🇾" },
  { code: "+598", country: "Uruguai", flag: "🇺🇾" },
  { code: "+591", country: "Bolívia", flag: "🇧🇴" },
  { code: "+81", country: "Japão", flag: "🇯🇵" },
  { code: "+86", country: "China", flag: "🇨🇳" },
  { code: "+82", country: "Coreia do Sul", flag: "🇰🇷" },
  { code: "+91", country: "Índia", flag: "🇮🇳" },
  { code: "+61", country: "Austrália", flag: "🇦🇺" },
  { code: "+64", country: "Nova Zelândia", flag: "🇳🇿" },
  { code: "+27", country: "África do Sul", flag: "🇿🇦" },
  { code: "+7", country: "Rússia", flag: "🇷🇺" },
  { code: "+90", country: "Turquia", flag: "🇹🇷" },
  { code: "+20", country: "Egito", flag: "🇪🇬" },
  { code: "+971", country: "Emirados Árabes", flag: "🇦🇪" },
];

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function PhoneInput({ value, onChange, placeholder }: PhoneInputProps) {
  // Extrai o código do país do valor (se existir)
  const getCountryCode = () => {
    if (!value) return "+55";
    const match = value.match(/^\+\d{1,4}/);
    return match ? match[0] : "+55";
  };

  // Extrai o número sem o código do país
  const getPhoneNumber = () => {
    if (!value) return "";
    const countryCode = getCountryCode();
    return value.replace(countryCode, "").trim();
  };

  const handleCountryChange = (newCode: string) => {
    const phoneNumber = getPhoneNumber();
    onChange(`${newCode} ${phoneNumber}`.trim());
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const countryCode = getCountryCode();
    const phoneNumber = e.target.value;
    onChange(`${countryCode} ${phoneNumber}`.trim());
  };

  return (
    <div className="flex gap-2">
      <Select value={getCountryCode()} onValueChange={handleCountryChange}>
        <SelectTrigger className="w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {countryCodes.map((country, index) => (
            <SelectItem key={`${country.code}-${index}`} value={country.code}>
              <span className="flex items-center gap-2">
                <span className="text-xl">{country.flag}</span>
                <span>{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={getPhoneNumber()}
        onChange={handlePhoneChange}
        placeholder={placeholder || "(64) 99999-1234"}
        className="flex-1"
      />
    </div>
  );
}
