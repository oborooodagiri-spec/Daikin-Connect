'use server';

import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export type DocumentType = 'service_activities' | 'ahu_audits' | 'daily_ops_logs' | 'corrective';
export type SignatureRole = 'customer' | 'engineer';

export async function saveSignature(
  documentType: DocumentType,
  documentId: number,
  role: SignatureRole,
  signatureBase64: string,
  signerName: string
) {
  try {
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'Unknown IP';
    const now = new Date();

    if (documentType === 'service_activities') {
      if (role === 'customer') {
        await prisma.service_activities.update({
          where: { id: documentId },
          data: {
            customer_signature: signatureBase64,
            customer_signature_ip: ipAddress,
            customer_approver_name: signerName,
            customer_approved_at: now,
            is_approved_by_customer: true
          }
        });
      } else if (role === 'engineer') {
        await prisma.service_activities.update({
          where: { id: documentId },
          data: {
            engineer_signature: signatureBase64,
            engineer_signature_ip: ipAddress,
            engineer_signer_name: signerName,
          }
        });
      }
    } 
    else if (documentType === 'ahu_audits') {
      if (role === 'customer') {
        await prisma.ahu_audits.update({
          where: { id: documentId },
          data: {
            customer_signature: signatureBase64,
            customer_signature_ip: ipAddress,
            customer_signature_date: now,
            approved_by: signerName,
            approval_status: 'Approved'
          }
        });
      }
    }
    else if (documentType === 'daily_ops_logs') {
      if (role === 'customer') {
        await prisma.daily_ops_logs.update({
          where: { id: documentId },
          data: {
            customer_signature: signatureBase64,
            customer_signature_ip: ipAddress,
            customer_approver_name: signerName,
            customer_approved_at: now,
          }
        });
      }
    }
    else if (documentType === 'corrective') {
      if (role === 'customer') {
        await prisma.corrective.update({
          where: { id: documentId },
          data: {
            customer_signature: signatureBase64,
            customer_signature_ip: ipAddress,
            customer_approver_name: signerName,
            customer_approved_at: now,
          }
        });
      }
    }
    else {
      throw new Error(`Document type ${documentType} not supported for signatures yet.`);
    }

    // Attempt to log the action to audit_logs if needed, we can do it here.
    // Revalidate paths based on the document type
    revalidatePath('/reports');
    revalidatePath(`/reports/${documentId}`);
    revalidatePath('/dashboard');

    return { success: true };
  } catch (error: any) {
    console.error("Save Signature Error:", error);
    return { success: false, error: error.message || "Failed to save signature" };
  }
}
