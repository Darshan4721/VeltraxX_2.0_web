export async function handleInitiatePpt() {
  return {
    status: 410,
    body: {
      success: false,
      code: 'PPT_ROUND_CANCELLED',
      error: 'Online PPT submission has been cancelled. VELTRAXX 2.0 is a direct single-round onsite hackathon.'
    }
  };
}

export default async function handler(req, res) {
  const result = await handleInitiatePpt();
  return res.status(result.status).json(result.body);
}
