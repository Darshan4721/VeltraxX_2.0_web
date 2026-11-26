export async function handlePptStatus() {
  return {
    status: 410,
    body: {
      success: false,
      code: 'PPT_ROUND_CANCELLED',
      error: 'Online PPT submission status is retired. VELTRAXX 2.0 is now a single-round hackathon.'
    }
  };
}

export default async function handler(req, res) {
  const result = await handlePptStatus();
  return res.status(result.status).json(result.body);
}
