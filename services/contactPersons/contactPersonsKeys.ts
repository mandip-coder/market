export const contactPersonsKeys = {
    all: () => ['contactPersons'] as const,
    contactsPersons: (hcoUUID: string) => [contactPersonsKeys.all(), hcoUUID] as const,
}