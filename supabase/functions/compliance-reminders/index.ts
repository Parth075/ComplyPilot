// Supabase Edge Function: compliance-reminders
// Automated deadline scanner sending reminder emails via Resend
// Server-side only: RESEND_API_KEY is never exposed to the client.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const resendApiKey = Deno.env.get("RESEND_API_KEY");

    // Use service role client to query compliance records and audit logs
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Fetch pending and overdue compliance records joined with profiles & requirements
    const { data: records, error } = await supabase
      .from("compliance_records")
      .select(`
        id,
        due_date,
        status,
        profiles:employee_id (id, full_name, email),
        compliance_requirements:requirement_id (title, cadence)
      `)
      .neq("status", "completed");

    if (error) throw error;

    let emailsSent = 0;
    const remindersLogged = [];

    if (records && records.length > 0) {
      for (const record of records) {
        const employee = Array.isArray(record.profiles) ? record.profiles[0] : record.profiles;
        const requirement = Array.isArray(record.compliance_requirements)
          ? record.compliance_requirements[0]
          : record.compliance_requirements;

        if (!employee || !employee.email || !requirement) continue;

        // If Resend API key is provided, send real transactional email
        if (resendApiKey) {
          try {
            const emailRes = await fetch("https://api.resend.com/emails", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${resendApiKey}`,
              },
              body: JSON.stringify({
                from: "ComplyPilot <onboarding@complypilot.app>",
                to: [employee.email],
                subject: `Reminder: Action required for "${requirement.title}"`,
                html: `
                  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 24px;">
                    <h2 style="color: #26745b; margin-top: 0;">ComplyPilot Action Required</h2>
                    <p>Hi ${employee.full_name},</p>
                    <p>This is a reminder that your compliance requirement <strong>"${requirement.title}"</strong> is scheduled for completion (Deadline: ${record.due_date}).</p>
                    <p>Please log in to your ComplyPilot workspace to review and complete this requirement.</p>
                    <div style="margin: 24px 0;">
                      <a href="${Deno.env.get("APP_BASE_URL") || "https://complypilot.app"}/app/tasks" style="background: #26745b; color: white; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600;">Open My Workspace</a>
                    </div>
                    <p style="color: #6a7c72; font-size: 12px; margin-top: 32px;">This is an automated notification from ComplyPilot People Operations.</p>
                  </div>
                `,
              }),
            });

            if (emailRes.ok) emailsSent++;
          } catch (sendErr) {
            console.error(`Failed to send email to ${employee.email}:`, sendErr);
          }
        }

        remindersLogged.push({
          employeeId: employee.id,
          employeeName: employee.full_name,
          requirementTitle: requirement.title,
          dueDate: record.due_date,
        });
      }

      // Write an entry to the audit log
      await supabase.from("audit_log").insert({
        action: "compliance_reminders_triggered",
        target_table: "compliance_records",
        metadata: {
          total_records_scanned: records.length,
          emails_sent: emailsSent,
          reminders: remindersLogged,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        scanned: records?.length || 0,
        emailsSent,
        reminders: remindersLogged,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
