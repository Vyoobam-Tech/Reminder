// components/ReportPanel.jsx
// import axios from 'axios';
import API from '../api/axiosInstance';
import { Box, Button ,Stack,Typography} from '@mui/material';

export default function ReportPanel() {
  const exportCustomers = async (type) => {
    try {
      const res = await API.get(`/api/reports/export?type=${type}`, {
        responseType: 'blob',
      });

      const blob = new Blob([res.data], {
        type: type === 'excel'
          ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          : 'application/pdf',
      });

      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = `customers.${type === 'excel' ? 'xlsx' : 'pdf'}`;
      link.click();
    } catch (err) {
      alert('Export failed');
      console.error(err);
    }
  };

  return (
    <>
     <Box sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight="600" gutterBottom>
        Reminder Reports
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        <Button variant="contained" onClick={() => exportCustomers('excel')}>
          Export Excel
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => exportCustomers('pdf')}
        >
          Export PDF
        </Button>
      </Stack>
    </Box>
    </>
  );
}
