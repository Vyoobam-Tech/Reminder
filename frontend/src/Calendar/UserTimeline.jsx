  import { List, ListItem, ListItemText, Typography, Card, CardContent } from '@mui/material';

  const dummyLogs = [
    { time: '2025-07-16 10:00 AM', message: 'Sent follow-up SMS to customer John' },
    { time: '2025-07-15 3:30 PM', message: 'User updated reminder for Mary' },
    { time: '2025-07-14 11:45 AM', message: 'Deleted reminder for Alex' },
  ];

  export default function UserTimeline() {
    return (
      <Card elevation={3} sx={{ borderRadius: 3, p: 2 }}>
        <CardContent>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Activity Timeline
          </Typography>
          <List>
            {dummyLogs.map((log, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={log.message}
                  secondary={log.time}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    );
  }
