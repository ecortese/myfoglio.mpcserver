import { z } from "zod";
import { apiClient } from "../client.js";
import type { ToolDefinition } from "../server.js";

const AddressSchema = z.object({
  Country: z.string().describe("Codice paese"),
  State: z.string().optional(),
  City: z.string().optional(),
  Street: z.string().optional(),
  ZipCode: z.string().optional(),
});

const TelephoneAndEmailSchema = z.object({
  Mobile: z.string().optional(),
  Phone: z.string().optional(),
  Fax: z.string().optional(),
  Email: z.string().optional(),
});

const BankAccountSchema = z.object({
  ReferencedBankID: z.number().int().positive().optional(),
  Name: z.string().optional(),
  IBAN: z.string().optional(),
  Agency: z.string().optional(),
  Swift: z.string().optional(),
  Holder: z.string().optional(),
  Currency: z.string().optional(),
  Balance: z.number().optional(),
  BalanceUpdate: z.string().optional(),
  Notes: z.string().optional(),
  Address: AddressSchema.optional(),
});

const ContactInfoSchema = z.object({
  Title: z.string().optional(),
  Name: z.string().optional(),
  Lastname: z.string().optional(),
  TelephoneAndEmail: TelephoneAndEmailSchema.optional(),
  Address: AddressSchema.optional(),
});

const ContactSchema = z.object({
  ReferencedContactID: z.number().int().positive().optional().describe("ID del contatto già presente in rubrica"),
  ContactType: z.string().optional(),
  Bank: BankAccountSchema.optional(),
  DocumentsLogoID: z.number().int().positive().optional(),
  CompanyName: z.string().describe("Ragione sociale del contatto"),
  WorkCompanyName: z.string().optional(),
  VatNumber: z.string().optional().describe("Partita IVA"),
  FiscalCode: z.string().optional().describe("Codice fiscale"),
  LegalAddress: AddressSchema.optional(),
  LegalTelephoneAndEmail: TelephoneAndEmailSchema.optional(),
  WorkAddress: AddressSchema.optional(),
  WorkTelephoneAndEmail: TelephoneAndEmailSchema.optional(),
  ContactInfo: ContactInfoSchema.optional(),
  DocumentHeaderText: z.string().optional(),
  DocumentFooterText: z.string().optional(),
});

const ItemSchema = z.object({
  ID: z.number().int().positive().optional(),
  ReferencedProductID: z.number().int().positive().optional(),
  ReferencedDeliveryNoteID: z.number().int().positive().optional(),
  CodeType: z.string().optional(),
  Code: z.string().optional(),
  Description: z.string().describe("Descrizione della riga"),
  Units: z.string().optional().describe("Unità di misura (es. 'pz', 'ore')"),
  Quantity: z.number().optional().describe("Quantità"),
  PricePerUnit: z.number().optional().describe("Prezzo unitario"),
  PricePerUnitDecimals: z.number().int().optional(),
  DiscountsAndSurcharges: z.string().optional(),
  Amount: z.number().optional(),
  VatRateCode: z.string().describe("Codice aliquota IVA (es. '22')"),
  InverseCalculation: z.boolean().optional(),
  IsExpense: z.boolean().optional(),
  Taxable: z.boolean().optional(),
});

const TotalsSchema = z.object({
  AmountToPay: z.number().optional(),
  AmountToPayOtherCurrency: z.number().optional(),
  Entries: z.record(z.unknown()).optional(),
  DiscountsAndSurcharges: z.string().optional(),
  AmountToPayRounding: z.number().optional(),
});

const PaymentInstalmentSchema = z.object({
  ID: z.number().int().positive().optional(),
  Amount: z.number().optional(),
  TermsValue: z.number().int().optional(),
  TermsValueType: z.string().optional(),
  PaymentTerms: z.string().optional(),
  DueDate: z.string().optional(),
  WasPaid: z.boolean().optional(),
  DontPrint: z.boolean().optional(),
});

const PaymentsDataSchema = z.object({
  DueDate: z.string().optional(),
  Paid: z.boolean().optional(),
  Instalments: z.array(PaymentInstalmentSchema).optional(),
});

const AttachmentSchema = z.object({
  Filename: z.string(),
  Content: z.string(),
});

const FatturaPASchema = z
  .object({
    DatiTrasmissione: z.record(z.unknown()).describe("Dati di trasmissione FatturaPA"),
  })
  .catchall(z.unknown());

// L'autofattura viene emessa verso sé stessi; Seller rappresenta la controparte.
const SelfInvoiceInputSchema = z.object({
  ExportTemplateID: z.number().int().positive().optional(),
  FiscalAccountRegimeID: z.number().int().positive().optional(),
  VatCollectability: z.string().optional(),
  ReferenceDocumentID: z.number().int().positive().optional(),
  Code: z.string().optional().describe("Numero documento"),
  SectionalID: z.number().int().positive().optional().describe("ID del sezionale"),
  IssueDate: z.string().optional().describe("Data di emissione (formato ISO 8601)"),
  AccountingDate: z.string().optional().describe("Data contabile (formato ISO 8601)"),
  Currency: z.string().optional().describe("Codice valuta (es. 'EUR')"),
  ExchangeCurrency: z.string().optional(),
  ExchangeRate: z.number().optional(),
  Seller: ContactSchema.optional().describe("Dati del cedente/prestatore (controparte nell'autofattura)"),
  Buyer: ContactSchema.optional().describe("Dati del cessionario/committente"),
  Items: z.array(ItemSchema).optional().describe("Righe del documento"),
  Totals: TotalsSchema.optional(),
  PaymentsData: PaymentsDataSchema.optional(),
  DocumentNotes: z.string().optional().describe("Note sul documento"),
  Notes: z.string().optional().describe("Note interne"),
  DocumentFormat: z.string().optional(),
  FatturaPA: FatturaPASchema.optional(),
  Attachments: z.array(AttachmentSchema).optional(),
  TriggersOnSave: z.array(z.string()).optional(),
  SendToBuyer: z.boolean().optional().describe("Se true, invia il documento al cliente"),
});

const SelfInvoiceCreateInputSchema = SelfInvoiceInputSchema.extend({
  Items: z.array(ItemSchema).describe("Righe del documento (obbligatorie)"),
});

const ENDPOINT = "/SelfInvoice";

export const selfInvoiceTools: ToolDefinition[] = [
  // ── 1. Lista ────────────────────────────────────────────────────────────────
  {
    name: "self_invoice_list",
    description: "Recupera la lista delle autofatture",
    inputSchema: z.object({}),
    handler: async () => {
      try {
        const { data } = await apiClient.get(ENDPOINT);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero della lista autofatture: ${String(err)}`);
      }
    },
  },

  // ── 2. Creazione ────────────────────────────────────────────────────────────
  {
    name: "self_invoice_create",
    description: "Crea una nuova autofattura (es. per reverse charge). Il campo principale della controparte è Seller",
    inputSchema: SelfInvoiceCreateInputSchema,
    handler: async (input) => {
      try {
        const { data } = await apiClient.post(ENDPOINT, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nella creazione dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 3. Aggiornamento ────────────────────────────────────────────────────────
  {
    name: "self_invoice_update",
    description: "Aggiorna un'autofattura esistente tramite ID",
    inputSchema: SelfInvoiceCreateInputSchema.extend({
      id: z.number().int().positive().describe("ID dell'autofattura da aggiornare"),
    }),
    handler: async (input) => {
      try {
        const { id, ...body } = input as { id: number } & Record<string, unknown>;
        const { data } = await apiClient.put(ENDPOINT, body, { params: { id } });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nell'aggiornamento dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 4. Eliminazione ─────────────────────────────────────────────────────────
  {
    name: "self_invoice_delete",
    description: "Elimina un'autofattura tramite ID",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID dell'autofattura da eliminare"),
    }),
    handler: async (input) => {
      try {
        const { id } = input as { id: number };
        const { data } = await apiClient.delete(ENDPOINT, { params: { id } });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nell'eliminazione dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 5. Prossimo numero documento ────────────────────────────────────────────
  {
    name: "self_invoice_next_code",
    description: "Ottieni il prossimo numero disponibile per un'autofattura",
    inputSchema: z.object({
      FiscalYear: z.number().int().describe("Anno fiscale per cui calcolare il prossimo numero"),
      SectionalID: z.number().int().positive().optional().describe("ID del sezionale (opzionale)"),
    }),
    handler: async (input) => {
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/action/NextCode`, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel recupero del prossimo numero autofattura: ${String(err)}`);
      }
    },
  },

  // ── 6. Trasmissione (SDI/fatturazione elettronica) ──────────────────────────
  {
    name: "self_invoice_transmit",
    description: "Trasmette un'autofattura al Sistema di Interscambio (SDI) per la fatturazione elettronica",
    inputSchema: z.object({
      id: z.number().int().positive().describe("ID dell'autofattura da trasmettere"),
    }),
    handler: async (input) => {
      try {
        const { id } = input as { id: number };
        const { data } = await apiClient.post(`${ENDPOINT}/action/Transmit`, undefined, {
          params: { id },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nella trasmissione dell'autofattura: ${String(err)}`);
      }
    },
  },

  // ── 7. Calcolo totali (senza salvataggio) ───────────────────────────────────
  {
    name: "self_invoice_calculate_totals",
    description: "Calcola i totali di un'autofattura senza salvarla",
    inputSchema: SelfInvoiceInputSchema,
    handler: async (input) => {
      try {
        const { data } = await apiClient.post(`${ENDPOINT}/action/CalculateTotals`, input);
        return { content: [{ type: "text" as const, text: JSON.stringify(data, null, 2) }] };
      } catch (err: unknown) {
        throw new Error(`Errore nel calcolo dei totali dell'autofattura: ${String(err)}`);
      }
    },
  },
];
