
export async function fetchAdvisors() {
  const res = await fetch("/api/department-head/advisors");
  const data = await res.json();
  console.log("advisors are :", data)
  if (!res.ok || !data.success) {
    throw new Error(data.error ||"Failed to fetch advisors");
  }
  return data.data;
}
export async function assignAdvisorToStudents(studentIds: string[],advisorId: string) {
  const res = await fetch("/api/department-head/advisors",{
      method: "POST",
      headers: {"Content-Type":"application/json",},
      body: JSON.stringify({studentIds, advisorId, }),
    });
   const data = await res.json();
   if (!res.ok) { throw new Error(data.error || "Advisor assignment failed" );}
   return data;
}