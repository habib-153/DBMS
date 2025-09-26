"use client";

import { Card, CardBody, CardHeader, Button } from "@heroui/react";
import { Phone, MapPin } from "lucide-react";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  address: string;
  type: "police" | "hospital" | "fire";
}

const emergencyContacts: EmergencyContact[] = [
  {
    id: "1",
    name: "Central City Police",
    phone: "999",
    address: "123 Police Plaza, Central City",
    type: "police",
  },
  {
    id: "2",
    name: "City General Hospital",
    phone: "102",
    address: "456 Health Ave, Central City",
    type: "hospital",
  },
  {
    id: "3",
    name: "Fire Department HQ",
    phone: "199",
    address: "789 Rescue Rd, Central City",
    type: "fire",
  },
];

const getContactIcon = (type: EmergencyContact["type"]) => {
  switch (type) {
    case "police":
      return "🚔";
    case "hospital":
      return "🏥";
    case "fire":
      return "🚒";
    default:
      return "📞";
  }
};

const getContactColor = (type: EmergencyContact["type"]) => {
  switch (type) {
    case "police":
      return "text-blue-600 dark:text-blue-400";
    case "hospital":
      return "text-red-600 dark:text-red-400";
    case "fire":
      return "text-orange-600 dark:text-orange-400";
    default:
      return "text-gray-600 dark:text-gray-400";
  }
};

export default function EmergencyContacts() {
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Phone className="w-5 h-5 text-brand-primary" />
          <h3 className="text-lg font-semibold">Emergency Contacts</h3>
        </div>
      </CardHeader>
      <CardBody className="pt-0 space-y-4">
        {emergencyContacts.map((contact) => (
          <div
            key={contact.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getContactIcon(contact.type)}</span>
                <div>
                  <h4
                    className={`font-semibold ${getContactColor(contact.type)}`}
                  >
                    {contact.name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <MapPin className="w-3 h-3" />
                    <span>{contact.address}</span>
                  </div>
                </div>
              </div>
            </div>

            <Button
              className="w-full bg-brand-primary hover:bg-brand-secondary text-white font-medium"
              size="sm"
              startContent={<Phone className="w-4 h-4" />}
              onClick={() => handleCall(contact.phone)}
            >
              Call {contact.phone}
            </Button>
          </div>
        ))}

        {/* Emergency Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 text-center">
          <h4 className="font-semibold text-red-800 dark:text-red-200 mb-1">
            Emergency Hotline
          </h4>
          <p className="text-sm text-red-600 dark:text-red-300 mb-3">
            For immediate assistance, call:
          </p>
          <Button
            className="bg-red-600 hover:bg-red-700 text-white font-bold text-lg"
            size="lg"
            onClick={() => handleCall("999")}
          >
            🚨 999
          </Button>
        </div>
      </CardBody>
    </Card>
  );
}
