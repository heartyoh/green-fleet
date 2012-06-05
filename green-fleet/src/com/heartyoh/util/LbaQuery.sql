select 
	alarm_name,
	loc_name,
	event_type
from (
	select 
		a.name alarm_name,
		l.name loc_name,
		case
		when 
			-- 현재 위치가 location boundary내에 있고 이전 위치가 location boundary 밖에 있는 경우 
			(a.evt_trg = 'in' or a.evt_trg = 'in-out') and 
			(l.lat_lo <= :current_lat and l.lat_hi >= :current_lat and l.lng_lo <= :current_lng and l.lng_hi >= :current_lng) and
			not (l.lat_lo <= :prev_lat and l.lat_hi >= :prev_lat and l.lng_lo <= :prev_lng and l.lng_hi >= :prev_lng)
		then 
			'in'
		when 
			-- 현재 위치가 location boundary밖에 있고 이전 위치가 location boundary 안에 있는 경우
			(a.evt_trg = 'out' or a.evt_trg = 'in-out') and
			not (l.lat_lo <= :current_lat and l.lat_hi >= :current_lat and l.lng_lo <= :current_lng and l.lng_hi >= :current_lng) and
			(l.lat_lo <= :prev_lat and l.lat_hi >= :prev_lat and l.lng_lo <= :prev_lng and l.lng_hi >= :prev_lng)		
		then 
			'out'
		else
			'no'
		end	event_type
	from 
		alarm a, 
		alarm_vehicle_relation avr,
		location l
	where 
		a.company = l.company and
		a.company = avr.company and
		a.name = avr.alarm_name and
		a.evt_type = 'location' and
		a.evt_name = l.name and
		a.company = :company and
		avr.vehicle_id = :vehicle_id
) tbl 
where 
	tbl.event_type != 'no'